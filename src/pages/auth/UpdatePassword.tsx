import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEventTracker } from '@/hooks/useEventTracker';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null); // New state to track session validity
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { trackAuthEvent, trackError } = useEventTracker();

  // Check if the user has a valid session after clicking the password recovery link
  // When the user clicks the link in the email, Supabase should have set up a temporary session
  useEffect(() => {
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setIsValidSession(false);
          setMessage({
            type: 'error',
            text: 'An error occurred while validating your session. Please request a new password reset.'
          });
          return;
        }

        if (session) {
          setIsValidSession(true);
        } else {
          // If no session exists, show an error message
          setIsValidSession(false);
          setMessage({
            type: 'error',
            text: 'Invalid or expired password reset link. Please request a new password reset.'
          });
        }
      } catch (error: any) {
        console.error('Error validating session:', error);
        setIsValidSession(false);
        setMessage({
          type: 'error',
          text: error.message || 'An error occurred while validating your session.'
        });
      }
    };

    validateSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate we have a valid session before proceeding
    if (isValidSession !== true) {
      setMessage({
        type: 'error',
        text: 'Invalid or expired session. Please request a new password reset.'
      });
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.'
      });
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long.'
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      // Track the password update event (try-catch to prevent errors from affecting password update)
      try {
        await trackAuthEvent('password_updated', 'update-password');
      } catch (trackingError) {
        console.error('Error tracking password update event:', trackingError);
        // Don't fail the password update if tracking fails
      }

      setMessage({
        type: 'success',
        text: 'Your password has been updated successfully!'
      });
      setIsPasswordUpdated(true);

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error updating password:', error);
      // Only track error if we have a session to avoid tracking errors during session issues
      if (isValidSession) {
        try {
          await trackError(error, 'UpdatePassword', 'handleSubmit');
        } catch (trackingError) {
          console.error('Error tracking password update error:', trackingError);
          // Don't fail the password update if tracking fails
        }
      }

      setMessage({
        type: 'error',
        text: error.message || 'An error occurred while updating your password.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-tonstores-lightgray flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Update Your Password</CardTitle>
          <CardDescription>
            Create a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {!isPasswordUpdated ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Re-enter your new password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleGoToLogin}>
                Back to Login
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Your password has been successfully updated. You will be redirected to the login page shortly.
              </p>
              <Button onClick={handleGoToLogin} className="w-full">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePassword;