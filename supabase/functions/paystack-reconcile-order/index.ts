import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
} from "../_shared/utils.ts";

/**
 * Reconciles a still-pending order with what Paystack actually reports.
 *
 * - Never marks an order as PAID (the webhook / verify function own that,
 *   including stock updates). If Paystack says "success" it only reports it.
 * - Marks the order cancelled/failed ONLY when Paystack confirms the
 *   transaction was not paid, so the browser cannot fake a cancellation.
 *
 * Body: { orderId: string, cancelled?: boolean }
 *   cancelled = true  -> the buyer came back via Paystack's Cancel link
 *   cancelled = false -> stale-order check (only fails orders older than 30 min)
 */

const STALE_AFTER_MS = 30 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return handleCorsOptions();
  if (req.method !== "POST") return jsonResponse(405, { error: "Method Not Allowed" });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const orderId: string | undefined = body?.orderId;
  const cancelled = body?.cancelled === true;

  if (!orderId || !UUID_RE.test(orderId)) {
    return jsonResponse(400, { error: "A valid orderId is required" });
  }

  const supabase = createSupabaseClient();
  if (!supabase) return jsonResponse(500, { error: "Supabase configuration is missing" });

  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK_SECRET_KEY) return jsonResponse(500, { error: "Paystack credentials not configured" });

  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_status, payment_reference, created_at")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) return jsonResponse(404, { error: "Order not found" });

    // Already settled (paid, failed, cancelled...): nothing to do.
    if (order.status !== "pending" || order.payment_status !== "pending") {
      return jsonResponse(200, {
        updated: false,
        reason: "already_settled",
        status: order.status,
        payment_status: order.payment_status,
      });
    }

    const ageMs = Date.now() - new Date(order.created_at).getTime();

    // Ask Paystack what really happened to this payment.
    let paystackStatus: string | null = null;
    if (order.payment_reference) {
      const resp = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(order.payment_reference)}`,
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } },
      );
      const result = await resp.json().catch(() => null);
      if (result?.status && result?.data?.status) {
        paystackStatus = result.data.status; // success | abandoned | failed | reversed | ongoing | pending ...
      }
    }

    // Money was actually received: do NOT cancel. Let the webhook / verify flow mark it paid.
    if (paystackStatus === "success") {
      return jsonResponse(200, {
        updated: false,
        reason: "paid_on_paystack",
        paystack_status: paystackStatus,
        needs_paid_sync: true,
      });
    }

    // Decide the new status.
    let newStatus: "cancelled" | "failed" | null = null;
    if (cancelled && (!paystackStatus || ["abandoned", "failed", "reversed"].includes(paystackStatus))) {
      newStatus = "cancelled"; // buyer clicked Cancel and nothing was paid
    } else if (
      ageMs > STALE_AFTER_MS &&
      (!paystackStatus || ["abandoned", "failed", "reversed"].includes(paystackStatus))
    ) {
      newStatus = "failed"; // old, unpaid, abandoned
    }

    if (!newStatus) {
      return jsonResponse(200, {
        updated: false,
        reason: "still_in_progress",
        paystack_status: paystackStatus,
      });
    }

    // Guarded update: only if it is still pending/pending (avoids racing the webhook).
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        payment_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("status", "pending")
      .eq("payment_status", "pending")
      .select("id");

    if (updateError) {
      console.error("Failed to update order:", updateError);
      return jsonResponse(500, { error: "Failed to update order" });
    }

    return jsonResponse(200, {
      updated: (updated?.length ?? 0) > 0,
      status: newStatus,
      payment_status: newStatus,
      paystack_status: paystackStatus,
    });
  } catch (error) {
    return handleCommonError(error, "Paystack order reconcile");
  }
});
