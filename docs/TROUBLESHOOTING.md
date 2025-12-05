# Troubleshooting Guide

## Common Issues and Solutions

### 1. Payment Amount Conversion Issue

**Problem:** Paystack payment failing with 400 Bad Request due to incorrect amount conversion.

**Solution:** 
- In our system, amounts are already stored in kobo (smallest currency unit) in the database
- When displaying to users, we divide by 100 to show in Naira
- When sending to Paystack, do NOT multiply by 100 again as the amounts are already in kobo
- Example: 3,900 Naira is stored as 390,000 kobo in the database and should be sent as 390,000 to Paystack

```typescript
// INCORRECT - Double conversion
const amountInKobo = Math.round(order.total_amount * 100); // Don't do this!

// CORRECT - Use the amount directly
const amountInKobo = order.total_amount; // Already in kobo
```

If you're seeing amounts like "390,000" instead of "3,900" in the UI, it means the amount is being double-converted.

### 2. Missing Supabase RPC Function

**Problem:** 404 Not Found error when calling `test_guest_id` RPC function.

**Solution:**
- Deploy the missing SQL function to your Supabase database
- Run the deployment script: `node scripts/deploy-test-guest-id.js`
- Alternatively, execute the SQL directly in the Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION public.test_guest_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result RECORD;
  guest_id text;
BEGIN
  -- Get the current guest ID using our existing function
  guest_id := public.get_current_guest_id();
  
  -- Return the guest ID
  RETURN guest_id;
EXCEPTION WHEN OTHERS THEN
  -- Return error information for debugging
  RETURN format('Error: %s', SQLERRM);
END;
$$;

-- Add comment to explain the function
COMMENT ON FUNCTION public.test_guest_id() IS 'Test function that returns the current guest ID for debugging purposes';
```

### 3. Subaccount Issues in Development Mode

**Problem:** Paystack payment failing in development mode due to subaccount configuration.

**Solution:**
- Skip subaccount configuration in development mode
- Add a check for development environment before adding split configuration:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

if (subaccountCode && !isDevelopment) {
  // Add split configuration
  paymentConfig.split = {
    type: "percentage",
    subaccounts: [
      {
        subaccount: subaccountCode,
        share: 95 // 95% goes to the seller
      }
    ]
  };
} else if (isDevelopment) {
  console.log("Skipping subaccount in development mode");
}
```

### 4. Datadog Browser SDK Storage Warning

**Problem:** "No storage available for session. We will not send any data."

**Solution:**
- This is typically caused by browser privacy settings or incognito mode
- It's not critical for functionality but affects monitoring
- If needed, you can make Datadog optional:

```typescript
// In your Datadog initialization code
try {
  // Initialize Datadog
  datadogRum.init({
    // ...configuration
  });
} catch (error) {
  console.warn("Datadog initialization failed, continuing without monitoring:", error);
}
```

## Debugging Guest Sessions

To debug guest session issues, use the `test_guest_id` function:

```typescript
const { data, error } = await supabase.rpc('test_guest_id');
console.log("Guest session verification:", { data, error });
```

This will help verify if the guest ID is properly set in the current session. 