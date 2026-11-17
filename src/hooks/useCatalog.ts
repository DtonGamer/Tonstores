import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useSubscriptionLimits } from "./useSubscriptionLimits";

export type Catalog = {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export const useCatalog = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { canCreateCatalog } = useSubscriptionLimits();

  const getCatalog = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("catalogs")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Error retrieving catalog",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Public storefront lookup.
   * Read path: does NOT toast. It returns null when the catalog isn't found
   * (PGRST116) and rethrows any other error so the calling view can show
   * a single error message.
   */
  const getCatalogBySlug = async (slug: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("catalogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      
      // Handle PGRST116 error (not found) specially
      if (error) {
        if (error.code === "PGRST116") {
          return null; // Return null instead of throwing for "not found"
        }
        throw error;
      }
      
      return data;
    } catch (error: any) {
      if (error?.code !== "PGRST116") {
        console.error("useCatalog: Error fetching catalog by slug:", error);
      }
      // No toast here: the view that called us owns the UI.
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createCatalog = async (catalogData: Omit<Catalog, "user_id">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a catalog",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }
    
    try {
      setIsLoading(true);
      
      // Check subscription limits before creating catalog
      const canCreate = await canCreateCatalog();
      if (!canCreate) {
        throw new Error("Subscription limit reached");
      }
      
      // Ensure slug is valid before attempting to save
      if (catalogData.slug.length < 3) {
        throw new Error("Slug must be at least 3 characters long");
      }
      
      // Create the insert payload
      const payload = {
        ...catalogData,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from("catalogs")
        .insert(payload)
        .select();
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("No data returned from catalog creation");
      }
      
      const createdCatalog = data[0];
      
      toast({
        title: "Catalog created",
      });
      
      return createdCatalog;
    } catch (error: any) {
      toast({
        title: "Error creating catalog",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCatalog = async (id: string, catalogData: Partial<Catalog>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("catalogs")
        .update({
          ...catalogData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Catalog updated",
        description: "Your catalog has been updated successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating catalog",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCatalog = async (id: string) => {
    try {
      setIsLoading(true);
      
      // First check if there are any orders associated with this catalog
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("catalog_id", id)
        .limit(1);
      
      if (ordersError) throw ordersError;
      
      // If orders exist, don't allow deletion
      if (ordersData && ordersData.length > 0) {
        throw new Error("Cannot delete catalog with existing orders. Please archive it instead.");
      }
      
      const { error } = await supabase
        .from("catalogs")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Catalog deleted",
        description: "Your catalog has been deleted successfully",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting catalog",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateUniqueSlug = async (name: string, currentCatalogId?: string) => {
    // Convert name to slug format and ensure minimum length
    let baseSlug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Remove consecutive hyphens
      .trim();
    
    // Ensure minimum length for slug (3+ characters)
    if (baseSlug.length < 3) {
      baseSlug = baseSlug.padEnd(3, baseSlug[0] || 'a');
    }
    
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;
    
    // Check if slug exists and generate a unique one
    while (!isUnique) {
      try {
        let query = supabase
          .from("catalogs")
          .select("count")
          .eq("slug", slug);
        
        // If we have a current catalog ID, exclude it from the check
        if (currentCatalogId) {
          query = query.neq("id", currentCatalogId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (!data || data.length === 0 || data[0].count === 0) {
          isUnique = true;
        } else {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      } catch (e) {
        // If error occurs, generate a new slug with timestamp to ensure uniqueness
        slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
        isUnique = true; // Break the loop
      }
    }
    
    return slug;
  };

  return {
    getCatalog,
    getCatalogBySlug,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    generateUniqueSlug,
    isLoading,
  };
};
