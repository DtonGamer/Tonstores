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
      .select('id, next_payout_available_at, paystack_subaccount_code')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error("❌ Profile not found:", profileError);
      return jsonResponse(404, { error: "Profile not found" });
    }

    // Check if 48 hours have passed since last payout
    const nextPayoutAvailableAt = profile.next_payout_available_at ? new Date(profile.next_payout_available_at) : new Date();
    const now = new Date();
    
    console.log("⏰ Next payout available at:", nextPayoutAvailableAt);
    console.log("⏰ Current time:", now);

    if (now < nextPayoutAvailableAt) {
      const hoursRemaining = Math.ceil((nextPayoutAvailableAt.getTime() - now.getTime()) / (1000 * 60 * 60));
      const nextAvailable = nextPayoutAvailableAt;
      
      console.log("⚠️ Payout requested too soon");
      return jsonResponse(400, {
        error: "Payout not available yet",
        message: `You must wait 48 hours between payouts. Next payout available in ${hoursRemaining} hours.`,
        hoursRemaining,
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

    console.log("💵 Available balance:", availableBalance);

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

    // Update next_payout_available_at to 48 hours from now
    const nextPayoutAvailable = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    
    await supabase
      .from('profiles')
      .update({
        next_payout_available_at: nextPayoutAvailable.toISOString()
      })
      .eq('id', userId);

    // Create a payout record
    const { error: payoutError } = await supabase
      .from('payouts')
      .insert([{
        seller_id: userId,
        amount: availableBalance,
        fee: Math.ceil(availableBalance * 0.02), // 2% platform fee
        net_amount: availableBalance * 0.98,
        status: 'processing',
        reference: reference,
        account_number: bankAccount.account_number,
        bank_name: bankAccount.bank_name,
        account_name: bankAccount.account_name
      }]);

    if (payoutError) {
      console.error("❌ Error creating payout record:", payoutError);
      // This is not critical as the payout was processed, just the record wasn't saved
    }

    console.log("🎉 === REQUEST PAYOUT SUCCESS ===");

    return jsonResponse(200, {
      status: true,
      message: "Payout requested successfully",
      data: {
        amount: availableBalance,
        reference: reference,
        transferCode: payoutResult.data.transfer_code,
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