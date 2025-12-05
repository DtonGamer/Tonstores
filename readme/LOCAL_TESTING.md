# Local Testing Guide for Payment Webhooks

This guide provides instructions for testing the payment webhook functionality locally.

## Setting Up

1. Make sure you have Netlify CLI installed:
   ```bash
   npm install -g netlify-cli
   ```

2. Start the Netlify development server:
   ```bash
   netlify dev
   ```

## Testing Webhooks in Development Mode

### Using cURL

You can test the webhook with cURL by sending a POST request with development mode enabled:

```bash
curl -X POST http://localhost:8888/.netlify/functions/paystack-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "dev_mode": true,
    "event": "charge.success",
    "data": {
      "reference": "test_ref_123",
      "amount": 5000,
      "status": "success",
      "metadata": {
        "order_id": "test-order-456",
        "seller_id": "test-seller-789"
      },
      "customer": {
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User"
      }
    }
  }'
```

### Testing with the Transfer Webhook

For testing transfer webhooks:

```bash
curl -X POST http://localhost:8888/.netlify/functions/transfer-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "dev_mode": true,
    "event": "transfer.success",
    "data": {
      "reference": "test_transfer_123",
      "amount": 10000,
      "status": "success"
    }
  }'
```

### Testing Different Payment Statuses

#### Success Payment

```bash
curl -X POST http://localhost:8888/.netlify/functions/transfer-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "dev_mode": true,
    "event": "charge.success",
    "order_id": "your-actual-order-id",
    "seller_id": "your-actual-seller-id"
  }'
```

#### Failed Payment

```bash
curl -X POST http://localhost:8888/.netlify/functions/transfer-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "dev_mode": true,
    "event": "charge.failed",
    "order_id": "your-actual-order-id",
    "seller_id": "your-actual-seller-id"
  }'
```

#### Cancelled Payment

```bash
curl -X POST http://localhost:8888/.netlify/functions/transfer-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "dev_mode": true,
    "event": "charge.dispute.create",
    "order_id": "your-actual-order-id",
    "seller_id": "your-actual-seller-id"
  }'
```

## Troubleshooting

### Port Issues

If you encounter port issues, try specifying a different port:

```bash
netlify dev -p 9000
```

Then update your test URLs to use that port.

### Authentication Issues

For local testing, we bypass authentication with `dev_mode: true`. In production, you'll need valid Paystack signatures.

### Database Connection

Make sure your local environment has the correct environment variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

## Production vs Development

In production, webhooks are authenticated using the Paystack signature. The `dev_mode` parameter only works in development environments where `process.env.DEV_MODE === 'true'`.

To enable development mode globally, add to your `.env.development` file:

```
DEV_MODE=true
``` 