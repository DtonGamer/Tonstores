import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
  mapSnakeToCamel
} from '../_shared/utils.ts';

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  // Only allow GET
  if (req.method !== "GET") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Check for development mode
  const url = new URL(req.url);
  const isDevelopmentMode = url.searchParams.get("dev_mode") === "true" || Deno.env.get("DEV_MODE") === "true";

  // Handle development mode with test data
  if (isDevelopmentMode) {
    // Return mock banks data
    const mockBanks = [
      {
        code: "044",
        name: "Access Bank",
        slug: "access-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "023",
        name: "Citi Bank",
        slug: "citi-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "050",
        name: "EcoBank Nigeria",
        slug: "ecobank-nigeria",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "070",
        name: "Fidelity Bank",
        slug: "fidelity-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "011",
        name: "First Bank of Nigeria",
        slug: "first-bank-of-nigeria",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "214",
        name: "First City Monument Bank",
        slug: "first-city-monument-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "058",
        name: "Guaranty Trust Bank",
        slug: "guaranty-trust-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "030",
        name: "Heritage Bank",
        slug: "heritage-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "301",
        name: "Jaiz Bank",
        slug: "jaiz-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "082",
        name: "Keystone Bank",
        slug: "keystone-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "076",
        name: "Polaris Bank",
        slug: "polaris-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "221",
        name: "Stanbic IBTC Bank",
        slug: "stanbic-ibtc-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "068",
        name: "Standard Chartered Bank",
        slug: "standard-chartered-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "232",
        name: "Sterling Bank",
        slug: "sterling-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "039",
        name: "Unity Bank",
        slug: "unity-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      },
      {
        code: "057",
        name: "Zenith Bank",
        slug: "zenith-bank",
        type: "nuban",
        gateway: null,
        active: true,
        country: "NG",
        currency: "NGN",
        is_deleted: false,
        createdAt: "2016-07-14T10:04:29.000Z",
        updatedAt: "2024-02-08T13:30:26.000Z"
      }
    ];

    return jsonResponse(200, {
      status: true,
      message: "Banks retrieved (Development Mode)",
      dev_mode: true,
      data: mockBanks,
      meta: {
        total: mockBanks.length,
        page: 1,
        per_page: 100,
        next_page: null,
        prev_page: null
      }
    });
  }

  try {
    // Get Paystack credentials from environment
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    // We require Paystack credentials for this operation
    if (!PAYSTACK_SECRET_KEY) {
      return jsonResponse(500, { error: "Paystack credentials not configured" });
    }

    // Call Paystack API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const params = new URLSearchParams({
      perPage: "100",  // Get all banks
    });

    const resp = await fetch(`https://api.paystack.co/bank?${params}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeout);
    const result = await resp.json();

    if (resp.status !== 200 || !result.status) {
      // Log detailed error info
      console.error("Paystack API error:", {
        status: resp.status,
        statusText: resp.statusText,
        result
      });

      // Forward Paystack error message with detailed info
      return jsonResponse(resp.status, {
        error: result.message || "Paystack API error",
        details: result
      });
    }

    // Success: return banks list
    return jsonResponse(200, {
      status: true,
      message: "Banks retrieved",
      data: result.data,
      meta: result.meta
    });
  } catch (error: any) {
    return handleCommonError(error, "Paystack banks retrieval");
  }
  }
});