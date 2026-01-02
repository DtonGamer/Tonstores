# Test Paystack Webhook Function
# This script tests the Paystack webhook function with a simulated charge.success event

# Set your Supabase URL and function name
$SUPABASE_URL = "http://127.0.0.1:54321/functions/v1/paystack-webhook"

# Test data for a successful charge event
$PAYLOAD = @{
    event = "charge.success"
    data = @{
        reference = "TEST_REF_12345"
        status = "success"
        amount = 20000
        currency = "NGN"
        transaction_date = "2023-12-01T10:00:00.000Z"
        gateway_response = "Successful"
        channel = "card"
        ip_address = "127.0.0.1"
        metadata = @{
            custom_fields = @(
                @{
                    display_name = "Order ID"
                    variable_name = "order_id"
                    value = "ORDER_12345"
                }
            )
        }
    }
} | ConvertTo-Json -Depth 10

Write-Host "Testing Paystack webhook function..." -ForegroundColor Green

# Send the request to the webhook function
try {
    $response = Invoke-RestMethod -Uri $SUPABASE_URL -Method Post -Body $PAYLOAD -ContentType "application/json" -Headers @{
        "X-Paystack-Signature" = "TEST_SIGNATURE"
    }
    
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nWebhook test completed." -ForegroundColor Green