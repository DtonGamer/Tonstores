import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEventTracker } from '@/hooks/useEventTracker';

const PasswordRecovery = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();
  const { trackAuthEvent, trackError } = useEventTracker();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      });

      if (error) {
        throw error;
      }

      // Track the password recovery request event
      trackAuthEvent('password_recovery_requested', 'email').catch(console.error);
      
      setMessage({
        type: 'success',
        text: 'Password recovery email sent! Check your inbox for instructions.'
      });
      setIsEmailSent(true);
    } catch (error: any) {
      console.error('Error sending password recovery email:', error);
      trackError(error, 'PasswordRecovery', 'handleSubmit').catch(console.error);
      
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred while sending the recovery email.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-tonstores-lightgray flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {!isEmailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Recovery Email'
                )}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleGoBack}>
                Back to Login
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                A password recovery link has been sent to your email address.
              </p>
              <Button onClick={handleGoBack} className="w-full">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordRecovery;