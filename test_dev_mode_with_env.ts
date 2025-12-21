// Simple test to validate development mode behavior of Supabase functions
// This test will work with deployed functions by sending dev_mode=true
// Loads environment variables from .env file

// First, load environment variables from .env file
await loadEnv();

import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

// Get configuration from environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("VITE_SUPABASE_ANON_KEY");
const PAYSTACK_PUBLIC_KEY = Deno.env.get("PAYSTACK_PUBLIC_KEY") || Deno.env.get("VITE_PAYSTACK_PUBLIC_KEY");

if (!SUPABASE_URL) {
  console.error("Error: SUPABASE_URL environment variable is required");
  Deno.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error("Error: SUPABASE_ANON_KEY environment variable is required");
  Deno.exit(1);
}

if (!PAYSTACK_PUBLIC_KEY) {
  console.error("Error: PAYSTACK_PUBLIC_KEY environment variable is required");
  Deno.exit(1);
}

// Test configuration
const headers = {
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

// Function to load environment variables from .env file
async function loadEnv() {
  try {
    const envFile = await Deno.readTextFile("./.env.test");
    const lines = envFile.split("\n");
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (key && value) {
          Deno.env.set(key, value);
        }
      }
    }
    console.log("Environment variables loaded from .env.test");
  } catch (error) {
    console.log("Could not load .env.test file:", error.message);
    console.log("Make sure you have a .env.test file with required environment variables");
  }
}

// Test Paystack Initialize Transaction with development mode
async function testPaystackInitializeTransaction() {
  console.log("Testing Paystack Initialize Transaction (Dev Mode)...");
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/paystack-initialize-transaction`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      amount: 10000, // 100 naira in kobo
      email: "test@example.com",
      currency: "NGN",
      reference: `test_ref_${Date.now()}`,
      publicKey: PAYSTACK_PUBLIC_KEY,
      dev_mode: true  // Enable development mode
    })
  });

  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2));
  
  assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
  assertEquals(data.status, true, "Expected status to be true");
  assertEquals(data.dev_mode, true, "Expected dev_mode to be true");
  assertEquals(data.message, "Transaction initialized (Development Mode)", "Expected development mode message");
  
  console.log("✓ Paystack Initialize Transaction development mode test passed\n");
}

// Test Paystack Verify Transaction with development mode
async function testPaystackVerifyTransaction() {
  console.log("Testing Paystack Verify Transaction (Dev Mode)...");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/paystack-verify-transaction?reference=test123&dev_mode=true`, {
    method: "GET",
    headers
  });

  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2));
  
  assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
  assertEquals(data.status, true, "Expected status to be true");
  assertEquals(data.dev_mode, true, "Expected dev_mode to be true");
  assertEquals(data.message, "Verification successful (Development Mode)", "Expected development mode message");
  
  console.log("✓ Paystack Verify Transaction development mode test passed\n");
}

// Test Paystack Banks with development mode
async function testPaystackBanks() {
  console.log("Testing Paystack Banks (Dev Mode)...");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/paystack-banks?dev_mode=true`, {
    method: "GET",
    headers
  });

  const data = await response.json();
  console.log("Response has", Array.isArray(data) ? data.length : 'unknown', "items");
  
  assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
  // In dev mode, it should return mock banks data
  console.log("✓ Paystack Banks development mode test passed\n");
}

// Test Track Event with development mode
async function testTrackEvent() {
  console.log("Testing Track Event (Dev Mode)...");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/track-event`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      event_type: "test_event",
      event_data: { test: "data" },
      source: "development"  // This should trigger development mode in track-event
    })
  });

  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2));
  
  assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
  assertEquals(data.success, true, "Expected success to be true");
  assertEquals(data.dev_mode, true, "Expected dev_mode to be true");
  
  console.log("✓ Track Event development mode test passed\n");
}

// Test Update Stock with development mode
async function testUpdateStock() {
  console.log("Testing Update Stock (Dev Mode)...");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/update-stock`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      orderId: "test-order-123",
      dev_mode: true  // Enable development mode
    })
  });

  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2));
  
  assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
  assertEquals(data.success, true, "Expected success to be true");
  assertEquals(data.dev_mode, true, "Expected dev_mode to be true");
  
  console.log("✓ Update Stock development mode test passed\n");
}

// Main test function
async function runDevModeTests() {
  console.log("Starting Development Mode Tests for Supabase Functions...\n");
  console.log("Testing with SUPABASE_URL:", SUPABASE_URL);
  console.log("This test will validate that functions return mock responses when dev_mode is enabled.\n");
  
  try {
    await testPaystackInitializeTransaction();
    await testPaystackVerifyTransaction();
    await testPaystackBanks();
    await testTrackEvent();
    await testUpdateStock();
    
    console.log("All development mode tests passed successfully!");
    console.log("Functions properly return mock data when dev_mode is enabled.");
  } catch (error) {
    console.error("Development mode test failed:", error);
    Deno.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  await runDevModeTests();
}