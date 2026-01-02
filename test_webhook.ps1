# Test Paystack Webhook Function
# This script tests the Paystack webhook function with a simulated charge.success event

# Set your Supabase URL and function name
$SUPABASE_URL = "https://hhxpuadernawdgdrdnok.supabase.co/functions/v1/paystack-webhook"

# Use a real order reference from your database or create a test order first
# Replace this with an actual payment reference from your orders table
$ORDER_REFERENCE = "PS_bd43d36a_1767368692361"  # Use your actual test order reference

# Test data for a successful charge event
$PAYLOAD = @{
    test_mode = $true  # This bypasses signature verification
    event = "charge.success"
    data = @{
        reference = $ORDER_REFERENCE
        status = "success"
        amount = 20000  # Amount in kobo (200 NGN)
        currency = "NGN"
        paid_at = "2026-01-02T15:45:30.000Z"
        transaction_id = "TEST_TXN_$(Get-Random -Minimum 1000000 -Maximum 9999999)"
        gateway_response = "Successful"
        channel = "card"
        ip_address = "127.0.0.1"
        customer = @{
            email = "test@example.com"
            customer_code = "CUS_test123"
        }
        metadata = @{
            order_id = "SELECT id, payment_reference, status, payment_status 
FROM orders 
WHERE id = 'bd43d36a-c9e5-4985-b57f-64630058f0f7"  # Replace with actual order ID
            customer_name = "Test Customer"
            custom_fields = @(
                @{
                    display_name = "Order ID"
                    variable_name = "order_id"
                    value = "bd43d36a-c9e5-4985-b57f-64630058f0f7"
                }
            )
        }
    }
} | ConvertTo-Json -Depth 10

Write-Host "=== Testing Paystack Webhook Function ===" -ForegroundColor Cyan
Write-Host "URL: $SUPABASE_URL" -ForegroundColor Gray
Write-Host "Order Reference: $ORDER_REFERENCE" -ForegroundColor Gray
Write-Host "Test Mode: Enabled (signature verification bypassed)" -ForegroundColor Yellow
Write-Host ""

# Send the request to the webhook function
try {
    Write-Host "Sending webhook request..." -ForegroundColor Green
    
    $response = Invoke-RestMethod `
        -Uri $SUPABASE_URL `
        -Method Post `
        -Body $PAYLOAD `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host ""
    Write-Host "✓ Webhook Response:" -ForegroundColor Green
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✓ Webhook test completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "✗ Error occurred:" -ForegroundColor Red
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get the response body
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
    catch {
        Write-Host "Could not read response body" -ForegroundColor Gray
    }
    
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Check your Supabase Edge Function logs" -ForegroundColor White
Write-Host "2. Verify the order status was updated in the database" -ForegroundColor White
Write-Host "3. Check if a ledger entry was created" -ForegroundColor White
Write-Host ""