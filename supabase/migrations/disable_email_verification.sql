-- Disable email verification for all existing users
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Set auto_confirm_new_users to true in auth.config
UPDATE auth.config
SET value = jsonb_set(value, '{security,auto_confirm_new_users}', 'true'); 