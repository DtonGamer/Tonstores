# Guest Session Handling System

This document explains how the guest session handling system works in the Tonstores application.

## Overview

The guest session system allows users to place orders and make payments without creating an account. It uses a combination of:

1. Client-side storage (localStorage) to persist guest IDs
2. Supabase functions authentication headers
3. PostgreSQL functions and RLS policies to secure access

## Key Components

### 1. Client-Side Session Management

The `sessionParams.ts` file contains the core functions for managing guest sessions:

- `getGuestUserId()`: Retrieves or generates a unique guest ID
- `setGuestSessionParam()`: Sets the guest ID in Supabase headers
- `ensureSessionParams()`: Ensures session parameters are set correctly
- `withSessionParams()`: Wrapper function for database operations

### 2. Database Functions

PostgreSQL functions handle guest authentication:

- `get_current_guest_id()`: Retrieves the guest ID from multiple sources
- `get_guest_orders()`: Securely retrieves orders for a guest

### 3. Row-Level Security (RLS) Policies

Updated RLS policies ensure guests can only access their own data:

```sql
CREATE POLICY "Guest users can view their own orders" 
ON public.orders
FOR SELECT
USING (
  (is_guest_order = true AND guest_id = get_current_guest_id()) OR
  (auth.uid() = user_id) OR
  (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
);
```

## How It Works

1. **Guest ID Generation**:
   - When a guest visits the site, a unique ID is generated and stored in localStorage
   - This ID is used as the guest's identifier throughout their session

2. **API Requests**:
   - Before making database requests, the guest ID is set in Supabase's auth headers
   - The `withSessionParams()` function ensures this happens automatically

3. **Database Access**:
   - PostgreSQL functions extract the guest ID from headers
   - RLS policies use this ID to restrict access to only the guest's own data

4. **Order Processing**:
   - When a guest places an order, their guest ID is stored with the order
   - This allows them to view and manage their orders without an account

## Best Practices

1. **Always use `withSessionParams()`** when making database requests that involve guest data
2. **Check order existence** before attempting updates
3. **Avoid verification steps** that require additional database queries
4. **Handle errors gracefully** and provide clear feedback to users

## Troubleshooting

If you encounter issues with guest sessions:

1. Check that `localStorage` is available and working
2. Verify the guest ID is being properly set in headers
3. Test database policies with the specific guest ID
4. Look for policy errors (code 42501) in the console

## Migration Notes

This implementation replaces the previous approach that used:

- RPC functions (`set_app_guest_id`, `get_app_guest_id`)
- Session parameters (`app.guest_id`)
- Verification steps after database operations

The new approach is more reliable and avoids timing issues with session parameter propagation. 