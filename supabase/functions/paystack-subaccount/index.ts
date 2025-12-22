import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
  mapSnakeToCamel
} from '../_shared/utils.ts';

// Define interface for Paystack subaccount payload
interface PaystackSubaccountPayload {
  business_name: string;
  account_number: string;
  bank_code: string;
  percentage_charge: number;
  settlement_bank?: string;
  primary_contact_email?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  metadata?: any;
  set_subaccount_split?: boolean;
  split_type?: string;
  split_value?: number;
  split_by?: Array<{
    subaccount: string;
    share: number;
  }>;
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Parse JSON body
  let data;
  try {
    data = await req.json();
  } catch (err) {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  // Check for development mode
  const devMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true" || isDevelopmentMode();

  // Map snake_case field names to camelCase if they exist
  // This allows the API to support both naming conventions
  if (data.business_name && !data.businessName) {
    data.businessName = data.business_name;
  }
  if (data.account_number && !data.accountNumber) {
    data.accountNumber = data.account_number;
  }
  if (data.bank_code && !data.bankCode) {
    data.bankCode = data.bank_code;
  }
  if (data.percentage_charge !== undefined && data.percentageCharge === undefined) {
    data.percentageCharge = data.percentage_charge;
  }
  if (data.user_id && !data.userId) {
    data.userId = data.user_id;
  }
  if (data.settlement_bank && !data.settlementBank) {
    data.settlementBank = data.settlement_bank;
  }
  if (data.primary_contact_email && !data.primaryContactEmail) {
    data.primaryContactEmail = data.primary_contact_email;
  }
  if (data.primary_contact_name && !data.primaryContactName) {
    data.primaryContactName = data.primary_contact_name;
  }
  if (data.primary_contact_phone && !data.primaryContactPhone) {
    data.primaryContactPhone = data.primary_contact_phone;
  }

  // Destructure required fields based on Paystack documentation
  const {
    businessName,
    accountNumber,
    bankCode,
    percentageCharge,
    settlementBank,
    primaryContactEmail,
    primaryContactName,
    primaryContactPhone,
    metadata,
    userId,
    setSubaccountSplit,
    splitType,
    splitValue,
    splitBy
  } = data;

  // Handle development mode with test data
  if (devMode) {
    // Use provided data or defaults for testing
    const testName = businessName || "Test Business";
    const testBankCode = bankCode || "057";
    const testAccountNumber = accountNumber || "0000000000";
    const testPercentageCharge = percentageCharge || 2;
    const testUserId = userId || "test-user-123";

    // Create mock subaccount response
    const mockSubaccountCode = `ACCT_${Math.random().toString(36).substring(2, 10)}`;
    const mockSubaccountId = `SUB_${Math.random().toString(36).substring(2, 10)}`;

    return jsonResponse(200, {
      status: true,
      message: "Subaccount created (Development Mode)",
      subaccount_code: mockSubaccountCode,
      dev_mode: true,
      data: {
        id: mockSubaccountId,
        subaccount_code: mockSubaccountCode,
        business_name: testName,
        description: `Subaccount for ${testName}`,
        primary_contact_email: primaryContactEmail || "test@example.com",
        primary_contact_name: primaryContactName || testName,
        primary_contact_phone: primaryContactPhone || "+2348000000000",
        percentage_charge: testPercentageCharge,
        settlement_bank: settlementBank || "057",
        account_number: testAccountNumber,
        bank_code: testBankCode,
        account_name: testName,
        active: true,
        switch_to_collection: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      request_data: {
        userId: testUserId,
        businessName: testName,
        bankCode: testBankCode,
        accountNumber: testAccountNumber,
        percentageCharge: testPercentageCharge,
        settlementBank: settlementBank || "057"
      }
    });
  }

  // Validate required fields according to Paystack docs
  if (!businessName || !accountNumber || !bankCode || percentageCharge === undefined) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["businessName", "accountNumber", "bankCode", "percentageCharge"]
    });
  }

  // Get user ID for database storage
  if (!userId) {
    return jsonResponse(400, { error: "User ID is required" });
  }

  // Initialize Supabase client using shared utility
  const supabase = createSupabaseClient();
  if (!supabase) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  // Get Paystack credentials from environment
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

  // We require Paystack credentials for this operation
  if (!PAYSTACK_SECRET_KEY) {
    return jsonResponse(500, { error: "Paystack credentials not configured" });
  }

  // Prepare payload for Paystack according to their API documentation
  const payload: PaystackSubaccountPayload = {
    business_name: businessName,
    account_number: accountNumber,
    bank_code: bankCode,
    percentage_charge: Number(percentageCharge),
    settlement_bank: settlementBank,
    primary_contact_email: primaryContactEmail,
    primary_contact_name: primaryContactName,
    primary_contact_phone: primaryContactPhone,
    metadata: metadata || {},
    ...(setSubaccountSplit !== undefined && { set_subaccount_split: setSubaccountSplit }),
    ...(splitType && { split_type: splitType }),
    ...(splitValue !== undefined && { split_value: splitValue }),
    ...(splitBy && { split_by: splitBy })
  };

  try {
    // Call Paystack API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const resp = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
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

    // Success: return subaccount code
    const subaccountCode = result.data?.subaccount_code;
    const subaccountId = result.data?.id;

    // Convert Paystack response data from snake_case to camelCase
    const camelCaseData = mapSnakeToCamel(result.data);

    // Store account info in database if supabase is available
    if (supabase) {
      try {
        // Store bank details in payment_accounts table
        await supabase.from('payment_accounts').upsert({
          profile_id: userId,
          bank_name: result.data?.account_name || businessName,
          account_number: accountNumber,
          account_name: result.data?.account_name || businessName,
          subaccount_code: subaccountCode,
          payment_gateway: 'paystack',
          created_at: new Date().toISOString()
        });

        // Update profile with subaccount code and KYC verification
        await supabase.from('profiles').update({
          paystack_subaccount_code: subaccountCode,
          kyc_verified: true,
          kyc_verified_at: new Date().toISOString()
        }).eq('id', userId);

      } catch (dbError) {
        console.error("Error updating user profile:", dbError);
        // Continue with response - we still created the subaccount, just failed to update local DB
      }
    }

    return jsonResponse(200, {
      status: true,
      message: "Subaccount created",
      subaccount_code: subaccountCode,
      data: camelCaseData
    });
  } catch (error) {
    return handleCommonError(error, "Paystack subaccount creation");
  }
});