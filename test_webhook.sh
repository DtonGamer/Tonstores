#!/bin/bash

# Test Paystack Webhook Function
# This script tests the Paystack webhook function with a simulated charge.success event

# Set your Supabase URL and function name
SUPABASE_URL="https://hhxpuadernawdgdrdnok.supabase.co/functions/v1/paystack-webhook"

# Test data for a successful charge event
PAYLOAD='{
  "event": "charge.success",
  "data": {
    "reference": "TEST_REF_12345",
    "status": "success",
    "amount": 20000,
    "currency": "NGN",
    "transaction_date": "2023-12-01T10:00:00.000Z",
    "gateway_response": "Successful",
    "channel": "card",
    "ip_address": "127.0.0.1",
    "metadata": {
      "custom_fields": [
        {
          "display_name": "Order ID",
          "variable_name": "order_id",
          "value": "ORDER_12345"
        }
      ]
    }
  }
}'

echo "Testing Paystack webhook function..."

# Send the request to the webhook function
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Paystack-Signature: TEST_SIGNATURE" \
  -d "$PAYLOAD" \
  "$SUPABASE_URL"

echo -e "\n\nWebhook test completed."