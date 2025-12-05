import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type Role = 'user' | 'admin';

/**
 * Update a user's role (admin only)
 * @param userId The ID of the user to update
 * @param newRole The new role to assign
 * @returns The updated user data
 */
export const updateUserRole = async (userId: string, newRole: Role) => {
  try {
    const { data, error } = await supabase.functions.invoke('update-user-role', {
      body: {
        target_user_id: userId,
        new_role: newRole,
      },
    });

    if (error) {
      toast({
        title: "Error updating user role",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "User role updated",
      description: `User role has been updated to ${newRole}`,
    });

    return data;
  } catch (error: any) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

/**
 * List all users (admin only)
 * This works because of the admin RLS policies we set up
 */
export const listAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get system-wide stats (admin only)
 */
export const getAdminStats = async () => {
  try {
    const [
      { count: totalUsers, error: usersError },
      { count: totalCatalogs, error: catalogsError },
      { count: totalProducts, error: productsError },
      { count: totalOrders, error: ordersError },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("catalogs").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
    ]);

    if (usersError || catalogsError || productsError || ordersError) {
      throw new Error("Error fetching admin stats");
    }

    return {
      totalUsers,
      totalCatalogs,
      totalProducts,
      totalOrders,
    };
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

/**
 * Check if the current user is an admin
 */
export const checkIsAdmin = async () => {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}; 