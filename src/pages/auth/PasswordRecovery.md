# Password Recovery System Documentation for Tonstores

## Overview

This document describes the implementation of the password recovery system for the Tonstores application. The system leverages Supabase's built-in authentication features to provide a secure and user-friendly password reset workflow.

## System Architecture

### Frontend Components

1. **PasswordRecovery.tsx**
   - Located at `/auth/recovery`
   - Allows users to enter their email address to request a password reset
   - Sends a password reset email using Supabase's `resetPasswordForEmail` method
   - Redirects users to their email client to access the reset link

2. **UpdatePassword.tsx**
   - Located at `/auth/update-password`
   - Allows users to set a new password after clicking the reset link
   - Validates that the new password matches the confirmation
   - Updates the user's password using Supabase's `updateUser` method
   - Redirects users to their dashboard after successful password update

### Backend (Supabase)

- Uses Supabase Auth for password reset functionality
- Automatically sends password reset emails
- Handles session management during reset process
- Validates new passwords

## Implementation Details

### Password Recovery Flow

1. User visits `/auth/recovery` and enters their email address
2. Frontend calls `supabase.auth.resetPasswordForEmail()` with the email and redirect URL
3. Supabase sends an email with a reset link to the user's address
4. User clicks the link in the email, which takes them to `/auth/update-password`
5. Supabase authenticates the user and allows them to update their password
6. User enters and confirms their new password
7. Frontend calls `supabase.auth.updateUser()` with the new password
8. User is redirected to the dashboard

### Security Considerations

- Password reset links are time-limited and single-use
- New passwords must be at least 6 characters long
- Password confirmation is required
- Session must be valid to access update password page
- Integration with Cloudflare Turnstile for bot protection

### Event Tracking

The system tracks password recovery-related events:

- `password_recovery_requested`: When a user requests a password reset
- `password_updated`: When a user successfully updates their password
- `error_occurred`: When an error occurs during the process

## Integration

### Email Template

The password recovery email uses Supabase's default template but can be customized in the Supabase dashboard under Authentication → Templates → Password Reset.

### Redirect URL

The redirect URL is configured to point to `/auth/update-password` to ensure the user lands on the correct page after clicking the recovery link.

## Usage

### Requesting Password Reset

Users can access the password recovery system by:

1. Clicking the "Forgot your password?" link on the login page
2. Navigating directly to `/auth/recovery`

### Updating Password

After clicking the password reset link in their email, users will be directed to the update password page where they can set a new password.

## Error Handling

The system provides appropriate error messages for various scenarios:

- Invalid email address
- Network errors
- Session issues
- Password validation failures
- Expired reset links

All errors are tracked with event logging for debugging and monitoring purposes.