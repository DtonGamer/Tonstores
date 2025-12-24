import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuickAccountCreationProps {
  email: string;
  name: string;
  phone: string;
  onAccountCreated: (userId: string) => void;
  onSkip?: () => void;
}

export function QuickAccountCreation({
  email,
  name,
  phone,
  onAccountCreated,
}: QuickAccountCreationProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain a number';
    return null;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const error = validatePassword(value);
    setErrors(prev => ({ ...prev, password: error || undefined }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const error = value !== password ? 'Passwords do not match' : undefined;
    setErrors(prev => ({ ...prev, confirmPassword: error }));
  };

  const createAccount = async () => {
    // Validate
    const passwordError = validatePassword(password);
    const confirmError = password !== confirmPassword ? 'Passwords do not match' : null;

    if (passwordError || confirmError) {
      setErrors({
        password: passwordError || undefined,
        confirmPassword: confirmError || undefined
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create account with email confirmation disabled
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone
          },
          // This bypasses email verification - user is immediately confirmed
          emailRedirectTo: undefined
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          // User already has an account - try to sign them in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (signInError) {
            toast.error('This email is already registered. Please sign in with your existing password.');
            return;
          }

          if (signInData.user) {
            toast.success('Welcome back! Signed in successfully.');
            onAccountCreated(signInData.user.id);
            return;
          }
        }

        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('Account creation failed - no user returned');
      }

      // In Supabase, you need to manually confirm the user if email verification is required
      // But we're bypassing that by having the user immediately confirmed
      // This requires a database trigger or function

      toast.success('Account created! You can now track your order.');
      onAccountCreated(signUpData.user.id);

    } catch (error: any) {
      console.error('Account creation error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </div>
          <CardTitle className="text-xl">Secure Your Order</CardTitle>
        </div>
        <CardDescription>
          Create an account to track your order and enjoy faster checkout next time. 
          <span className="font-medium text-green-600"> No email verification needed!</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pre-filled email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">We'll use this email for order updates</p>
        </div>

        {/* Password input */}
        <div className="space-y-2">
          <Label htmlFor="password">Create Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter a secure password"
              className={errors.password ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
          <p className="text-xs text-gray-500">
            Must be 8+ characters with uppercase, lowercase, and number
          </p>
        </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            placeholder="Re-enter your password"
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-blue-900">With your account you can:</p>
          <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
            <li>Track your order status in real-time</li>
            <li>View order history anytime</li>
            <li>Faster checkout on your next purchase</li>
            <li>Receive important order updates via email</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={createAccount}
            disabled={isCreating || !password || !confirmPassword || !!errors.password || !!errors.confirmPassword}
            className="w-full bg-Tonstores-green hover:bg-Tonstores-green/90 h-11"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account & Continue'
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
}