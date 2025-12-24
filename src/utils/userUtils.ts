import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for handling user roles and types
 */
export const userUtils = {
  /**
   * Check if the current user is a buyer
   */
  async isBuyer(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking user type:', error);
        return false;
      }

      return data.user_type === 'buyer';
    } catch (error) {
      console.error('Error checking if user is buyer:', error);
      return false;
    }
  },

  /**
   * Check if the current user is a seller
   */
  async isSeller(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking user type:', error);
        return false;
      }

      return data.user_type === 'seller';
    } catch (error) {
      console.error('Error checking if user is seller:', error);
      return false;
    }
  },

  /**
   * Check if the current user is an admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking user role:', error);
        return false;
      }

      return data.role === 'admin';
    } catch (error) {
      console.error('Error checking if user is admin:', error);
      return false;
    }
  },

  /**
   * Get the current user's type
   */
  async getUserType(): Promise<'buyer' | 'seller' | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error getting user type:', error);
        return null;
      }

      return data.user_type as 'buyer' | 'seller';
    } catch (error) {
      console.error('Error getting user type:', error);
      return null;
    }
  },

  /**
   * Get the current user's role
   */
  async getUserRole(): Promise<'user' | 'admin' | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error getting user role:', error);
        return null;
      }

      return data.role as 'user' | 'admin';
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }
};