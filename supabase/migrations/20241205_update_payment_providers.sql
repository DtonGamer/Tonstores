-- Migration to update payment_provider values in orders table from 'paystack' to 'monnify'
-- This migration updates existing orders to use 'monnify' instead of 'paystack'

UPDATE orders 
SET payment_provider = 'monnify'
WHERE payment_provider = 'paystack';

-- Update any existing subscription records to use 'monnify' as payment provider
UPDATE subscriptions
SET payment_provider = 'monnify'
WHERE payment_provider = 'paystack';