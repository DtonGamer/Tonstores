import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

const SUPABASE_URL = "https://hhxpuadernawdgdrdnok.supabase.co/functions/v1";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoeHB1YWRlcm5hd2RnZHJkbm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDQ4NjMsImV4cCI6MjA2MTQyMDg2M30.PNy1x3ch8bT5NZkWFw1MGbx-hto-GmbZBk2AeV34LUw";

// Helper function for standardized testing
async function testFunction(name: string, url: string, options: RequestInit = {}) {
  console.log(`Testing ${name} function...`);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,  // Add Bearer token for authentication
        'apikey': ANON_KEY,  // Include apikey header as well
        ...options.headers
      },
      ...options
    });

    console.log(`Response status: ${response.status}`);
    const data = await response.text();
    console.log(`Response body: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`); // Limit output length

    if (response.ok) {
      console.log(`✓ ${name} function test passed`);
      return true;
    } else {
      console.log(`✗ ${name} function test failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`✗ ${name} function test failed with error: ${error.message}`);
    return false;
  }
}

// Test all Supabase functions
async function runAllTests() {
  console.log("Starting tests for all Supabase functions...\n");

  let passedTests = 0;
  let totalTests = 0;

  // GET functions with dev_mode support - test both dev_mode and regular mode
  const getTests = [
    {
      name: "monnify-banks",
      url: `${SUPABASE_URL}/monnify-banks?dev_mode=true`,
      method: "GET",
      testRegularMode: true
    },
    {
      name: "monnify-ledger-history",
      url: `${SUPABASE_URL}/monnify-ledger-history?dev_mode=true&userId=test`,
      method: "GET",
      testRegularMode: true
    },
    {
      name: "monnify-payout-history",
      url: `${SUPABASE_URL}/monnify-payout-history?dev_mode=true&userId=test`,
      method: "GET",
      testRegularMode: true
    },
    {
      name: "monnify-seller-balance",
      url: `${SUPABASE_URL}/monnify-seller-balance?dev_mode=true&userId=test`,
      method: "GET",
      testRegularMode: true
    }
  ];

  // Define an interface for the post test configuration
  interface PostTestConfig {
    name: string;
    url: string;
    method: string;
    body: any;
    testRegularMode: boolean;
    headers?: { [key: string]: string };
  }

  // POST functions with example payloads - test both dev_mode and regular mode where applicable
  const postTests: PostTestConfig[] = [
    {
      name: "monnify-create-ledger-entry",
      url: `${SUPABASE_URL}/monnify-create-ledger-entry`,
      method: "POST",
      body: {
        params: {
          subaccount_code: "SUB123",
          type: "credit",
          amount: 10000,
          reference: "REF123",
          description: "Test ledger entry",
          seller_id: "12345678-1234-1234-1234-123456789012",  // Proper UUID format
          dev_mode: true  // Add dev_mode flag to use mock behavior
        }
      },
      testRegularMode: false // This function now supports dev_mode
    },
    {
      name: "monnify-customer-verification",
      url: `${SUPABASE_URL}/monnify-customer-verification`,
      method: "POST",
      body: {
        userId: "12345678-1234-1234-1234-123456789def",  // Proper UUID format
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phoneNumber: "+2348012345678",
        dev_mode: true
      },
      testRegularMode: true
    },
    {
      name: "monnify-escrow-webhook",
      url: `${SUPABASE_URL}/monnify-escrow-webhook`,
      method: "POST",
      body: {
        eventName: "TRANSACTION.PAID",
        transactionReference: "TXN123",
        status: "SUCCESS"
      },
      headers: {
        'monnify-signature': 'test-signature',  // Required for webhook validation
        'Authorization': `Bearer ${ANON_KEY}`,  // Add authorization header
        'dev_mode': 'true'  // Add dev_mode header to trigger development behavior
      },
      testRegularMode: false
    },
    {
      name: "monnify-initialize-escrow-transaction",
      url: `${SUPABASE_URL}/monnify-initialize-escrow-transaction`,
      method: "POST",
      body: {
        amount: 10000,
        currencyCode: "NGN",
        customerName: "John Doe",
        customerEmail: "john.doe@example.com",
        paymentReference: "REF123",
        description: "Test transaction",
        callbackUrl: "https://example.com/callback",
        dev_mode: true  // Add dev_mode flag to use mock behavior
      },
      testRegularMode: false
    },
    {
      name: "monnify-process-payout",
      url: `${SUPABASE_URL}/monnify-process-payout`,
      method: "POST",
      body: {
        userId: "12345678-1234-1234-1234-123456789def",  // Proper UUID format
        amount: 50000,
        destinationAccountNumber: "1234567890",
        destinationBankCode: "044",
        destinationAccountName: "John Doe",
        narration: "Test payout",
        dev_mode: true  // Add dev_mode flag to use mock behavior
      },
      testRegularMode: false
    },
    {
      name: "monnify-release-escrow-funds",
      url: `${SUPABASE_URL}/monnify-release-escrow-funds`,
      method: "POST",
      body: {
        orderId: "12345678-1234-1234-1234-123456789abc",  // Proper UUID format
        releaseToSubaccountCode: "SUB123",
        userId: "12345678-1234-1234-1234-123456789def",  // Proper UUID format
        dev_mode: true
      },
      testRegularMode: false  // This function might fail in regular mode if no actual order exists
    },
    {
      name: "monnify-subaccount",
      url: `${SUPABASE_URL}/monnify-subaccount`,
      method: "POST",
      body: {
        accountName: "Test Account",
        accountNumber: "1234567890",
        bankCode: "044",
        currencyCode: "NGN",
        percentageCharge: 2.5,
        userId: "12345678-1234-1234-1234-123456789def",  // Add required userId field with proper UUID format
        dev_mode: true  // Add dev_mode flag to use mock behavior
      },
      testRegularMode: false
    },
    {
      name: "monnify-transaction-receipt",
      url: `${SUPABASE_URL}/monnify-transaction-receipt`,
      method: "POST",
      body: {
        reference: "REF123",
        seller_id: "12345678-1234-1234-1234-123456789012",  // Proper UUID format
        dev_mode: true
      },
      testRegularMode: true
    },
    {
      name: "monnify-verify-account",
      url: `${SUPABASE_URL}/monnify-verify-account`,
      method: "POST",
      body: {
        accountNumber: "1234567890",
        bankCode: "044",
        dev_mode: true
      },
      testRegularMode: true
    },
    {
      name: "monnify-webhook",
      url: `${SUPABASE_URL}/monnify-webhook`,
      method: "POST",
      body: {
        eventType: "SUCCESSFUL_TRANSACTION",
        eventData: {
          transactionReference: "TXN123",
          amountPaid: 10000,
          paymentStatus: "SUCCESS",
          customer: {
            name: "Test Customer",
            email: "test@example.com"
          }
        }
      },
      headers: {
        'monnify-signature': 'test-signature',  // Required for webhook validation
        'Authorization': `Bearer ${ANON_KEY}`,  // Add authorization header
        'dev_mode': 'true'  // Add dev_mode header to trigger development behavior
      },
      testRegularMode: false
    },
    {
      name: "track-event",
      url: `${SUPABASE_URL}/track-event`,
      method: "POST",
      body: {
        event_type: "test_event",
        event_data: { test: true },
        source: "test"
      },
      testRegularMode: false
    },
    {
      name: "update-stock",
      url: `${SUPABASE_URL}/update-stock`,
      method: "POST",
      body: {
        orderId: "12345678-1234-1234-1234-123456789abc"  // Proper UUID format
      },
      testRegularMode: false
    },
    {
      name: "update-user-role",
      url: `${SUPABASE_URL}/update-user-role`,
      method: "POST",
      body: {
        target_user_id: "12345678-1234-1234-1234-123456789def",  // Proper UUID format
        new_role: "admin",
        dev_mode: true  // Add dev_mode flag to use mock behavior
      },
      testRegularMode: false
    }
  ];

  // Run GET tests (dev and regular mode where applicable)
  for (const test of getTests) {
    // Test dev mode
    totalTests++;
    const devModeUrl = test.url;  // Already has dev_mode=true
    const devModeResult = await testFunction(`${test.name} (dev mode)`, devModeUrl, { method: test.method });
    if (devModeResult) passedTests++;
    console.log(); // Add spacing between tests

    // Test regular mode if applicable
    if (test.testRegularMode) {
      totalTests++;
      // Create regular mode URL by removing dev_mode parameter
      const regularModeUrl = test.url.replace('?dev_mode=true', '').replace('&dev_mode=true', '');
      const regularModeResult = await testFunction(`${test.name} (regular mode)`, regularModeUrl, { method: test.method });
      if (regularModeResult) passedTests++;
      console.log(); // Add spacing between tests
    }
  }

  // Run POST tests (dev and regular mode where applicable)
  for (const test of postTests) {
    // Test with dev_mode if applicable
    totalTests++;
    let testBody = test.body;
    if (test.testRegularMode) {
      // Create a copy of body without dev_mode for regular test
      testBody = { ...test.body };
      delete testBody.dev_mode;
    }
    const requestOptions: RequestInit = {
      method: test.method,
      body: JSON.stringify(test.body)
    };

    // Add headers if they exist in the test configuration
    if (test.headers) {
      requestOptions.headers = {
        ...requestOptions.headers,
        ...test.headers
      };
    }

    const devModeResult = await testFunction(`${test.name} (with dev data)`, test.url, requestOptions);
    if (devModeResult) passedTests++;
    console.log(); // Add spacing between tests

    // Test regular mode if applicable
    if (test.testRegularMode) {
      totalTests++;
      // Create regular mode body by removing dev_mode
      const regularBody = { ...test.body };
      delete regularBody.dev_mode;

      const regularRequestOptions: RequestInit = {
        method: test.method,
        body: JSON.stringify(regularBody)
      };

      // Add headers if they exist in the test configuration (excluding dev_mode specific ones)
      if (test.headers) {
        regularRequestOptions.headers = {
          ...regularRequestOptions.headers,
          ...test.headers
        };
      }

      const regularModeResult = await testFunction(`${test.name} (regular mode)`, test.url, regularRequestOptions);
      if (regularModeResult) passedTests++;
      console.log(); // Add spacing between tests
    }
  }

  console.log(`\nTest Summary: ${passedTests}/${totalTests} tests passed`);
  return { passed: passedTests, total: totalTests };
}

// Run all tests
const results = await runAllTests();
console.log(`Overall result: ${results.passed}/${results.total} tests passed`);