# Adding a User to the Pro Plan Manually

This guide provides the SQL commands needed to manually add a user to the Pro plan in the Tonstores Catalog Hub application.

## Step 1: Find the Pro Plan ID

First, check the existing pricing plans to identify the Pro plan ID:

```sql
SELECT id, name, description, monthly_price, yearly_price 
FROM pricing_plans;
```

Look for the plan that corresponds to the Pro plan and note its ID.

## Step 2: Find the User ID

Find the user's ID in the profiles table:

```sql
SELECT id, email, full_name, created_at 
FROM profiles 
WHERE email = 'user@example.com';  -- Replace with the actual user's email
```

Note the user's ID for the next step.

## Step 3: Add the User to the Pro Plan

### Option A: Insert a New Subscription

If the user doesn't already have a subscription, insert a new record:

```sql
INSERT INTO subscriptions (
  user_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  payment_provider,
  payment_provider_subscription_id,
  created_at,
  updated_at
) VALUES (
  'USER_ID_HERE',           -- Replace with the actual user ID
  'PRICING_PLAN_ID_HERE',   -- Replace with the Pro plan ID
  'active',
  NOW(),
  NOW() + INTERVAL '1 year', -- Or '1 month' for monthly plan
  FALSE,
  NULL,                     -- payment_provider can only be 'paystack' or NULL
  NULL,
  NOW(),
  NOW()
);
```

### Option B: Update an Existing Subscription

If the user already has a subscription, update the existing record:

```sql
UPDATE subscriptions
SET
  plan_id = 'PRICING_PLAN_ID_HERE',  -- Replace with the Pro plan ID
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 year', -- Or '1 month' for monthly plan
  payment_provider = NULL,            -- payment_provider can only be 'paystack' or NULL
  updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';      -- Replace with the actual user ID
```

## Important Notes

- Make sure to replace `USER_ID_HERE` with the actual UUID of the user
- Make sure to replace `PRICING_PLAN_ID_HERE` with the actual UUID of the Pro plan
- The `current_period_end` is set to one year from now; adjust as needed for monthly plans
- The `payment_provider` field can only be 'paystack' or NULL due to a check constraint
- Setting `payment_provider` to NULL indicates this is a manually assigned subscription
- Always backup your database before making manual changes