# Seller Balance Ledger System

This document outlines the implementation of the seller balance tracking system using a double-entry ledger approach.

## Overview

The ledger system tracks all financial transactions for seller accounts, providing an accurate and auditable record of credits (incoming payments) and debits (outgoing payouts).

## Database Schema

The system uses a `ledger_entries` table with the following structure:

```sql
CREATE TABLE public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subaccount_code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  reference TEXT NOT NULL,
  description TEXT,
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Entry Types

- **Credit**: Records money coming into a seller's account (e.g., from sales)
- **Debit**: Records money going out of a seller's account (e.g., payouts to their bank account)

## Integration Points

### 1. Webhook Handlers

The system listens to Paystack webhooks to automatically record transactions:

- `payment.success`: Creates credit entries when payments are received
- `transfer.success`: Creates debit entries when payouts are processed

### 2. API Endpoints

- `GET /api/payment/seller-balance`: Calculates the current balance from ledger entries
- `GET /api/payment/ledger-history`: Returns paginated ledger entries with summary
- `POST /api/payment/ledger-entry`: Creates a new ledger entry (internal use)

### 3. Frontend Components

- `PaymentDashboard`: Displays the ledger history and current balance
- `ConnectedAccountInfo`: Shows the current balance from the ledger

## Balance Calculation

The balance is calculated using the formula:

```
Balance = Sum(Credits) - Sum(Debits)
```

This is implemented in SQL as:

```sql
SELECT
  SUM(CASE WHEN type='credit' THEN amount ELSE -amount END) AS current_balance
FROM ledger_entries
WHERE seller_id = :seller_id;
```

## Fallback Mechanism

For backward compatibility, the system falls back to the old balance calculation method if:

1. The seller doesn't have a subaccount code
2. No ledger entries exist for the seller
3. An error occurs when fetching ledger entries

## Security

- Row-Level Security (RLS) policies ensure sellers can only see their own ledger entries
- Admin users can view all ledger entries
- API endpoints validate user permissions before returning data

## Reconciliation

Periodic reconciliation can be performed by comparing:

1. The ledger balance
2. The sum of completed orders minus payouts
3. The Paystack subaccount balance (via Paystack API)

## Future Improvements

1. **Batch Processing**: Implement batch processing for high-volume transactions
2. **Automatic Reconciliation**: Schedule regular reconciliation jobs
3. **Dispute Handling**: Add specific entry types for disputed transactions
4. **Export Functionality**: Allow sellers to export ledger history 