import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserRole {
  id: string;
  role: 'user' | 'admin';
  user_type: 'buyer' | 'seller';
}

/**
 * Service for managing user roles and types
 */
export const roleService = {
  /**
   * Get the current user's role and type
   */
  async getCurrentUserRole(): Promise<UserRole | null> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, user_type')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error getting user role:', error);
      return null;
    }

    return data;
  },

  /**
   * Check if the current user is a buyer
   */
  async isBuyer(): Promise<boolean> {
    const userRole = await this.getCurrentUserRole();
    return userRole?.user_type === 'buyer';
  },

  /**
   * Check if the current user is a seller
   */
  async isSeller(): Promise<boolean> {
    const userRole = await this.getCurrentUserRole();
    return userRole?.user_type === 'seller';
  },

  /**
   * Check if the current user is an admin
   */
  async isAdmin(): Promise<boolean> {
    const userRole = await this.getCurrentUserRole();
    return userRole?.role === 'admin';
  },

  /**
   * Check if the current user has admin privileges
   */
  async hasAdminPrivileges(): Promise<boolean> {
    const userRole = await this.getCurrentUserRole();
    return userRole?.role === 'admin';
  },

  /**
   * Update user type (admin only)
   */
  async updateUserType(userId: string, userType: 'buyer' | 'seller'): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if the current user is an admin
      const isAdmin = await this.isAdmin();
      if (!isAdmin) {
        return { success: false, error: 'Only admins can update user types' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user type:', error);
        return { success: false, error: error.message };
      }

      toast.success(`User type updated to ${userType}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user type:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create a new buyer account (for internal use)
   */
  async createBuyerAccount(email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      // Create the user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'buyer'
          },
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      });

      if (signUpError) {
        console.error('Error creating buyer account:', signUpError);
        return { success: false, error: signUpError.message };
      }

      if (!signUpData.user) {
        return { success: false, error: 'Account creation failed - no user returned' };
      }

      return { success: true, userId: signUpData.user.id };
    } catch (error: any) {
      console.error('Error creating buyer account:', error);
      return { success: false, error: error.message };
    }
  }
};