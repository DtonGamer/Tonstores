#!/usr/bin/env node

/**
 * Automated Payout Engine
 * 
 * This script processes payouts for sellers with a positive balance.
 * It is designed to be run as a cron job every 48 hours.
 * 
 * Usage:
 * node process-payouts.js
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const { loadEnv } = require('vite');

// Load environment variables
dotenv.config();
const env = loadEnv('', process.cwd(), 'VITE_');

// Initialize Supabase client
const supabase = createClient(
  env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Paystack API
const PAYSTACK_SECRET_KEY = env.VITE_PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_URL = 'https://api.paystack.co';

// Utility function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Exponential backoff retry
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries > maxRetries) {
        throw error;
      }
      
      const delay = initialDelay * Math.pow(2, retries - 1);
      // console.log(`Retry ${retries} after ${delay}ms delay`);
      await sleep(delay);
    }
  }
}

// Process a payout for a seller
async function processPayout(seller, balance) {
  try {
    // console.log(`Processing payout for seller ${seller.id} with balance ${balance}`);
    
    // Calculate the fee and net amount
    const fee = Math.ceil(balance * 0.02); // 2% fee
    const netAmount = balance - fee;
    
    // Generate a unique reference
    const reference = `payout-${seller.id}-${Date.now()}`;
    
    // Create the payout record in the database first
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        seller_id: seller.id,
        amount: balance,
        fee: fee,
        net_amount: netAmount,
        status: 'processing',
        reference: reference,
        account_number: seller.bank_account_number,
        bank_name: seller.bank_name,
        account_name: seller.bank_account_name
      })
      .select()
      .single();
      
    if (payoutError) {
      console.error(`Error creating payout record for seller ${seller.id}:`, payoutError);
      return false;
    }
    
    // Call Paystack API to process the transfer
    const transferResponse = await retryWithBackoff(async () => {
      const response = await fetch(`${PAYSTACK_API_URL}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
        },
        body: JSON.stringify({
          source: 'balance',
          recipient: seller.paystack_recipient_code || seller.paystack_subaccount_code,
          amount: netAmount, // Amount in kobo
          reason: `TonStores payout for ${seller.business_name}`,
          currency: 'NGN',
          reference: reference
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Paystack API error: ${errorData.message || 'Unknown error'}`);
      }
      
      return response.json();
    });
    
    // Update the payout record with the transfer ID
    await supabase
      .from('payouts')
      .update({
        transfer_id: transferResponse.data.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', payout.id);
      
    // console.log(`Payout processed successfully for seller ${seller.id}, transfer ID: ${transferResponse.data.id}`);
    return true;
  } catch (error) {
    console.error(`Error processing payout for seller ${seller.id}:`, error);
    
    // Update the payout record with error status
    if (payout) {
      await supabase
        .from('payouts')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', payout.id);
    }
    
    return false;
  }
}

// Main function to process all payouts
async function processAllPayouts() {
  try {
    // console.log('Starting automated payout process...');
    
    // Get all sellers with KYC verified
    const { data: sellers, error: sellersError } = await supabase
      .from('profiles')
      .select(`
        id, 
        business_name, 
        paystack_subaccount_id,
        paystack_subaccount_code,
        bank_account_number,
        bank_name,
        bank_account_name
      `)
      .eq('kyc_verified', true)
      .not('paystack_subaccount_code', 'is', null);
      
    if (sellersError) {
      console.error('Error fetching sellers:', sellersError);
      return;
    }
    
    // console.log(`Found ${sellers.length} sellers with verified KYC`);
    
    // Process each seller
    for (const seller of sellers) {
      // Calculate the seller's balance
      const balance = await getSellerBalance(seller.id);
      
      // Skip if balance is too low (e.g., less than ₦1000)
      if (balance < 100000) { // 100000 kobo = ₦1000
        // console.log(`Skipping seller ${seller.id} with insufficient balance: ${balance}`);
        continue;
      }
      
      // Process the payout
      await processPayout(seller, balance);
      
      // Sleep to avoid rate limiting
      await sleep(1000);
    }
    
    // console.log('Automated payout process completed');
  } catch (error) {
    console.error('Error in payout process:', error);
  }
}

// Get the seller's current balance
async function getSellerBalance(sellerId) {
  try {
    // Get the total amount of successful orders for this seller
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('seller_id', sellerId)
      .eq('status', 'completed')
      .eq('payment_status', 'paid');

    if (orderError) {
      console.error('Error fetching orders:', orderError);
      return 0;
    }

    // Calculate the total sales
    const totalSales = orderData.reduce((sum, order) => sum + order.total_amount, 0);

    // Get the total amount already paid out
    const { data: payoutData, error: payoutError } = await supabase
      .from('payouts')
      .select('amount')
      .eq('seller_id', sellerId)
      .in('status', ['completed', 'processing']);

    if (payoutError) {
      console.error('Error fetching payouts:', payoutError);
      return 0;
    }

    // Calculate the total payouts
    const totalPayouts = payoutData.reduce((sum, payout) => sum + payout.amount, 0);

    // Calculate the available balance
    return totalSales - totalPayouts;
  } catch (error) {
    console.error('Error calculating balance:', error);
    return 0;
  }
}

// Run the main function
processAllPayouts().catch(console.error); 