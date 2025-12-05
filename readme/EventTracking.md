# Event Tracking System Documentation for TonStores

## Overview

This document describes the implementation of an event tracking system for the TonStores application. The system was designed as a lightweight alternative to complex analytics infrastructure, storing behavioral data in the existing Supabase database rather than adding external services.

## System Architecture

### Database Schema

The system uses a new `events` table added to the existing Supabase PostgreSQL database:

```sql
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Can be null for system events
  session_id text, -- To group events from the same session
  event_type text NOT NULL, -- e.g., 'workflow_executed', 'tweet_posted', 'ui_interaction'
  event_data jsonb DEFAULT '{}', -- Additional event-specific data
  source text DEFAULT 'frontend', -- 'frontend', 'backend', 'system'
  created_at timestamptz DEFAULT now()
);
```

Database Policies:
- Row Level Security (RLS) is enabled to restrict access
- Users can only access their own events
- System events are allowed with user_id as NULL

## Implementation Details

### Event Tracker Utility

The `eventTracker.ts` utility provides functions for tracking various types of events:

- `trackEvent()`: Generic event tracking function
- `trackPageView()`: Track page visits
- `trackButtonClick()`: Track button interactions
- `trackFormSubmit()`: Track form submissions
- `trackPaymentEvent()`: Track payment-related events
- `trackProductEvent()`: Track product interactions
- `trackAuthEvent()`: Track authentication events
- `trackSubscriptionEvent()`: Track subscription events
- `trackKYCEvent()`: Track KYC verification events
- `trackError()`: Track error events

### React Hooks

The `useEventTracker` hook provides access to tracking functions in React components:

```typescript
const { trackButtonClick, trackPageView } = useEventTracker();
```

There's also a `usePageViewTracker` hook that automatically tracks page views when added to the main App component.

## Usage Examples

### Basic Event Tracking

```typescript
import { useEventTracker } from '@/hooks/useEventTracker';

const MyComponent = () => {
  const { trackButtonClick } = useEventTracker();
  
  const handleClick = () => {
    trackButtonClick('my-button', 'MyComponent').catch(console.error);
  };
  
  return <button onClick={handleClick}>Click me</button>;
};
```

### Tracking Product Events

```typescript
import { useEventTracker } from '@/hooks/useEventTracker';

const ProductCard = ({ product }) => {
  const { trackProductEvent } = useEventTracker();
  
  const handleView = () => {
    trackProductEvent('product_viewed', product.id, product.name, product.catalog_id);
  };
  
  return (
    <div onClick={handleView}>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </div>
  );
};
```

### Using Component Event Tracker Hook

```typescript
import { useComponentEventTracker } from '@/hooks/useEventTracker';

const CheckoutComponent = () => {
  const { trackEvent, trackFormSubmit } = useComponentEventTracker('CheckoutComponent');
  
  const handleSubmit = (formData) => {
    trackFormSubmit('checkout-form', formData).catch(console.error);
    // Process checkout...
  };
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.target)); }}>
      {/* Form fields */}
      <button type="submit">Complete Order</button>
    </form>
  );
};
```

## Event Types

Common event types used in the system:
- `catalog_viewed`: When a catalog is viewed
- `product_viewed`: When a product is viewed
- `product_added_to_cart`: When a product is added to cart
- `checkout_initiated`: When checkout process starts
- `payment_initiated`: When payment process starts
- `payment_completed`: When payment is completed
- `payment_failed`: When payment fails
- `order_created`: When an order is created
- `order_completed`: When an order is completed
- `subscription_initiated`: When subscription starts
- `subscription_completed`: When subscription is completed
- `kyc_submitted`: When KYC information is submitted
- `kyc_verified`: When KYC verification is completed
- `subaccount_created`: When a subaccount is created
- `profile_updated`: When profile is updated
- `login`: When user logs in
- `logout`: When user logs out
- `signup`: When user signs up
- `page_view`: When a page is viewed
- `button_click`: When a button is clicked
- `form_submit`: When a form is submitted
- `error_occurred`: When an error occurs

## Privacy Considerations

- Only event keys are tracked in form submissions, not values, to protect user privacy
- RLS policies ensure users can only access their own events
- Sensitive data should not be stored in the event_data field

## Development

To enable event tracking in development mode, set the following environment variable:

```env
VITE_ENABLE_EVENT_TRACKING=true
```

This prevents excessive event generation during development while still allowing testing.

## Querying Events

Events can be queried directly from the Supabase database:

```sql
-- Get all events for a user
SELECT * FROM events WHERE user_id = 'user-uuid' ORDER BY created_at DESC;

-- Get specific event types
SELECT * FROM events WHERE event_type = 'payment_completed' ORDER BY created_at DESC;

-- Count events by type
SELECT event_type, COUNT(*) FROM events GROUP BY event_type;
```