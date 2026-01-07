import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode
} from '../_shared/utils.ts';

serve(async (req) => {
  console.log("🚀 === REQUEST PAYOUT START ===");
  
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  let data;
  try {
    data = await req.json();
    console.log("📦 Payout request received");
  } catch (err) {
    console.error("❌ Error parsing JSON body:", err);
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const devMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true" || isDevelopmentMode();
  const { userId } = data;

  if (!userId) {
    return jsonResponse(400, { error: "User ID is required" });
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  try {
    // Get seller profile
    console.log("🔍 Fetching seller profile...");
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, last_payout_at, paystack_subaccount_code')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error("❌ Profile not found:", profileError);
      return jsonResponse(404, { error: "Profile not found" });
    }

    // Check if next working day has passed since last payout (T+1 schedule)
    const lastPayoutAt = profile.last_payout_at ? new Date(profile.last_payout_at) : null;
    const now = new Date();

    // For T+1 (next working day) schedule, we need to check if at least one full day has passed
    // and if the last payout wasn't made today (to allow daily payouts on working days)
    let isEligibleForPayout = true;
    if (lastPayoutAt) {
      // Calculate difference in days
      const timeDiff = now.getTime() - lastPayoutAt.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      // Check if last payout was made today (same calendar day)
      const lastPayoutDate = lastPayoutAt.getDate();
      const lastPayoutMonth = lastPayoutAt.getMonth();
      const lastPayoutYear = lastPayoutAt.getFullYear();

      const currentDate = now.getDate();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // If last payout was made today, user needs to wait until tomorrow
      if (lastPayoutDate === currentDate &&
          lastPayoutMonth === currentMonth &&
          lastPayoutYear === currentYear) {
        isEligibleForPayout = false;
      }
    }

    console.log("⏰ Days since last payout:", lastPayoutAt ? (now.getTime() - lastPayoutAt.getTime()) / (1000 * 60 * 60 * 24) : 'Never');

    if (!isEligibleForPayout) {
      const nextAvailable = new Date(now);
      nextAvailable.setDate(now.getDate() + 1); // Next day
      nextAvailable.setHours(0, 0, 0, 0); // Start of the day

      console.log("⚠️ Payout requested too soon");
      return jsonResponse(400, {
        error: "Payout not available yet",
        message: "Next payout available tomorrow. Paystack follows T+1 (next working day) schedule.",
        nextAvailableAt: nextAvailable.toISOString()
      });
    }

    // Get ledger balance
    console.log("💰 Calculating available balance...");
    const { data: ledgerEntries, error: ledgerError } = await supabase
      .from('ledger_entries')
      .select('type, amount')
      .eq('seller_id', userId);

    if (ledgerError) {
      console.error("❌ Error fetching ledger:", ledgerError);
      return jsonResponse(500, { error: "Failed to calculate balance" });
    }

    const credits = ledgerEntries
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const debits = ledgerEntries
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const availableBalance = credits - debits;

    console.log("💵 Available balance:", availableBalance / 100);

    if (availableBalance <= 0) {
      return jsonResponse(400, {
        error: "Insufficient balance",
        message: "You don't have any funds available for payout",
        availableBalance: 0
      });
    }

    // Get bank account details
    console.log("🏦 Fetching bank account...");
    const { data: bankAccount, error: bankError } = await supabase
      .from('payment_accounts')
      .select('account_number, account_name, bank_code, bank_name')
      .eq('profile_id', userId)
      .single();

    if (bankError || !bankAccount) {
      console.error("❌ Bank account not found:", bankError);
      return jsonResponse(404, { 
        error: "Bank account not found",
        message: "Please set up your bank account details first"
      });
    }

    // Generate reference
    const reference = `PAYOUT_${userId.substring(0, 8)}_${Date.now()}`;

    console.log("💸 Initiating payout transfer...");

    // Call the payout function
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return jsonResponse(500, { error: "Server configuration error" });
    }

    const payoutResponse = await fetch(`${SUPABASE_URL}/functions/v1/paystack-process-payout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: availableBalance,
        destinationAccountNumber: bankAccount.account_number,
        destinationBankCode: bankAccount.bank_code,
        destinationAccountName: bankAccount.account_name,
        reference: reference,
        narration: `Payout to ${bankAccount.account_name}`,
        userId: userId,
        dev_mode: devMode
      })
    });

    const payoutResult = await payoutResponse.json();

    if (!payoutResponse.ok || !payoutResult.status) {
      console.error("❌ Payout failed:", payoutResult);
      return jsonResponse(payoutResponse.status, {
        error: "Payout failed",
        message: payoutResult.error || "Failed to process payout",
        details: payoutResult
      });
    }

    console.log("✅ Payout initiated successfully");

    // Update last_payout_at and next_payout_available_at
    // For T+1 schedule, next payout is available tomorrow (next working day)
    const nextPayoutAvailable = new Date(now);
    nextPayoutAvailable.setDate(now.getDate() + 1); // Next day
    nextPayoutAvailable.setHours(0, 0, 0, 0); // Start of the day

    await supabase
      .from('profiles')
      .update({
        last_payout_at: now.toISOString(),
        next_payout_available_at: nextPayoutAvailable.toISOString()
      })
      .eq('id', userId);

    console.log("🎉 === REQUEST PAYOUT SUCCESS ===");

    return jsonResponse(200, {
      status: true,
      message: "Payout requested successfully. Funds will be transferred according to Paystack's T+1 (next working day) schedule.",
      data: {
        amount: availableBalance,
        reference: reference,
        transferCode: payoutResult.data.transferCode,
        nextPayoutAvailable: nextPayoutAvailable.toISOString(),
        bankAccount: {
          accountName: bankAccount.account_name,
          accountNumber: bankAccount.account_number,
          bankName: bankAccount.bank_name
        }
      }
    });

  } catch (error) {
    console.error("❌ === REQUEST PAYOUT FAILED ===");
    console.error("❌ Error:", error);
    return handleCommonError(error, "Request payout processing");
  }
});