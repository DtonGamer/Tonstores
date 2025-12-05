import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling email operations
 */
export const emailService = {
  /**
   * Send a verification email to the user using Supabase's built-in email verification
   * @param email The user's email
   */
  async sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the email is valid before attempting to send
      if (!email || !email.includes('@')) {
        return { 
          success: false, 
          error: 'Invalid email format' 
        };
      }
      
      // Use Supabase's built-in email verification
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      });
      
      if (resendError) {
        return {
          success: false,
          error: resendError.message || 'Failed to send verification email'
        };
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to send verification email. Please contact support.' 
      };
    }
  },
  
  /**
   * Send a welcome email to the user with verification instructions
   * @param email The user's email
   * @param businessName The user's business name
   */
  async sendWelcomeEmail(email: string, businessName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the email is valid before attempting to send
      if (!email || !email.includes('@')) {
        return { 
          success: false, 
          error: 'Invalid email format' 
        };
      }
      
      // First send the verification email
      const verificationResult = await this.sendVerificationEmail(email);
      if (!verificationResult.success) {
        return verificationResult;
      }
      
      // You could implement additional custom welcome email logic here
      // For example, using a third-party email service
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to send welcome email. Please contact support.' 
      };
    }
  },
  
  /**
   * Send a password reset email to the user using Supabase's built-in password reset
   * @param email The user's email
   */
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Use Supabase's built-in password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to send password reset email'
        };
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to send password reset email'
      };
    }
  }
}; 