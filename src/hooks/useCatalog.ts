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

  const getCatalogBySlug = async (slug: string) => {
    try {
      setIsLoading(true);
      
     // // console.log("useCatalog: Getting catalog by slug:", slug);
      const { data, error } = await supabase
        .from("catalogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      
      // Handle PGRST116 error (not found) specially
      if (error) {
        if (error.code === "PGRST116") {
          //// console.log("useCatalog: No active catalog found for slug:", slug);
          return null; // Return null instead of throwing for "not found"
        }
    //    console.error("useCatalog: Error fetching catalog:", error);
        throw error;
      }
      
      // // console.log("useCatalog: Found catalog:", data);
      return data;
    } catch (error: any) {
   //   console.error("useCatalog: Error in getCatalogBySlug:", error);
      
      // Don't show toast for "not found" errors
      if (error.code !== "PGRST116") {
        toast({
          title: "Error retrieving catalog",
          description: error.message,
          variant: "destructive",
        });
      }
      
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
      
     // // console.log("Creating catalog with data:", catalogData);
      
      // Create the insert payload
      const payload = {
        ...catalogData,
        user_id: user.id,
      };
 //     // console.log("Insert payload:", payload);
      
      const { data, error, status, statusText } = await supabase
        .from("catalogs")
        .insert(payload)
        .select();
      
     // // console.log("Supabase response:", { data, error, status, statusText });
      
      if (error) {
    //    console.error("Database error creating catalog:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("No data returned from catalog creation");
      }
      
      const createdCatalog = data[0];
     // // console.log("Catalog created successfully:", createdCatalog);
      
      toast({
        title: "Catalog created",
      //  description: "Your catalog has been created successfully",
      });
      
      return createdCatalog;
    } catch (error: any) {
    //  console.error("Error creating catalog:", error);
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
   // // console.log("Generating slug from name:", name);
    
    // Convert name to slug format and ensure minimum length
    let baseSlug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Remove consecutive hyphens
      .trim();
    
    // Ensure minimum length for slug (3+ characters)
    if (baseSlug.length < 3) {
    //  // console.log("Slug too short, padding to minimum length:", baseSlug);
      baseSlug = baseSlug.padEnd(3, baseSlug[0] || 'a');
    }
    
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;
    
    // Check if slug exists and generate a unique one
    while (!isUnique) {
      try {
     //   // console.log("Checking if slug exists:", slug);
        
        let query = supabase
          .from("catalogs")
          .select("count")
          .eq("slug", slug);
        
        // If we have a current catalog ID, exclude it from the check
        if (currentCatalogId) {
          query = query.neq("id", currentCatalogId);
        }
        
        const { data, error } = await query;
        
     //   // console.log("Slug check response:", { data, error });
        
        if (error) {
      //    console.error("Error checking slug:", error);
          throw error;
        }
        
        if (!data || data.length === 0 || data[0].count === 0) {
          isUnique = true;
       //   // console.log("Slug is unique:", slug);
        } else {
          slug = `${baseSlug}-${counter}`;
          counter++;
         // // console.log("Slug already exists, trying new slug:", slug);
        }
      } catch (e) {
       // console.error("Error in slug generation:", e);
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
