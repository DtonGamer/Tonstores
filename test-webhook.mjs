// test-webhook.mjs
import https from 'https';

const SUPABASE_URL = 'hhxpuadernawdgdrdnok.supabase.co';
const WEBHOOK_PATH = '/functions/v1/paystack-webhook';

// Get your anon key from Supabase Dashboard → Settings → API
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoeHB1YWRlcm5hd2RnZHJkbm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDQ4NjMsImV4cCI6MjA2MTQyMDg2M30.PNy1x3ch8bT5NZkWFw1MGbx-hto-GmbZBk2AeV34LUw';

// Replace these with your actual order details
const ORDER_REFERENCE = 'PS_bd43d36a_1767368692361';
const ORDER_ID = 'bd43d36a-c9e5-4985-b57f-64630058f0f7';

const payload = {
  test_mode: true,
  event: 'charge.success',
  data: {
    reference: ORDER_REFERENCE,
    status: 'success',
    amount: 20000,
    currency: 'NGN',
    paid_at: new Date().toISOString(),
    transaction_id: `TEST_TXN_${Math.floor(Math.random() * 10000000)}`,
    gateway_response: 'Successful',
    channel: 'card',
    ip_address: '127.0.0.1',
    customer: {
      email: 'test@example.com',
      customer_code: 'CUS_test123'
    },
    metadata: {
      order_id: ORDER_ID,
      customer_name: 'Test Customer',
      custom_fields: [
        {
          display_name: 'Order ID',
          variable_name: 'order_id',
          value: ORDER_ID
        }
      ]
    }
  }
};

const payloadString = JSON.stringify(payload);

const options = {
  hostname: SUPABASE_URL,
  port: 443,
  path: WEBHOOK_PATH,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payloadString),
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY
  }
};

console.log('\n=== Testing Paystack Webhook Function ===');
console.log(`URL: https://${SUPABASE_URL}${WEBHOOK_PATH}`);
console.log(`Order Reference: ${ORDER_REFERENCE}`);
console.log(`Order ID: ${ORDER_ID}`);
console.log('Test Mode: Enabled\n');

console.log('Sending webhook request...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}\n`);
    
    if (res.statusCode === 200) {
      console.log('✓ Webhook Response:');
      console.log('─────────────────────────────────────');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        console.log(data);
      }
      console.log('─────────────────────────────────────\n');
      console.log('✓ Webhook test completed successfully!\n');
      
      console.log('Next steps:');
      console.log('1. Check Supabase Edge Function logs');
      console.log('2. Verify order status in database:');
      console.log(`   SELECT status, payment_status FROM orders WHERE id = '${ORDER_ID}';`);
      console.log('3. Check ledger entry:');
      console.log(`   SELECT * FROM ledger_entries WHERE reference = '${ORDER_REFERENCE}';`);
      console.log('');
    } else {
      console.log('✗ Error Response:');
      console.log('─────────────────────────────────────');
      console.log(data);
      console.log('─────────────────────────────────────\n');
    }
  });
});

req.on('error', (error) => {
  console.error('✗ Error occurred:');
  console.error('─────────────────────────────────────');
  console.error(error.message);
  console.error('─────────────────────────────────────\n');
});

req.write(payloadString);
req.end();