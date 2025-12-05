import { useCallback } from "react";
import useAuth from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useSubscriptionLimits = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();

  // Function to get current user limits based on their subscription
  const getUserLimits = useCallback(async () => {
    if (!user) {
      return { 
        canCreateCatalog: false, 
        canAddProduct: false,
        productLimit: 0,
        catalogLimit: 0,
        error: "Authentication required" 
      };
    }

    let productLimit = 0;
    let catalogLimit = 0;

    try {
      // If user has a subscription, get the limits from their plan
      if (subscription && subscription.pricing_plans) {
        productLimit = subscription.pricing_plans.features?.product_limit || 0;
        catalogLimit = subscription.pricing_plans.features?.catalog_limit || 0;
      } else {
        // Default to free tier for users without subscription
        const { data: freePlan, error } = await supabase
          .from("pricing_plans")
          .select("features")
          .eq("name", "Free")
          .single();

        if (error) throw error;
        
        productLimit = freePlan.features?.product_limit || 10;
        catalogLimit = freePlan.features?.catalog_limit || 1;
      }

      // Get current counts
      const { data: catalogsData, error: catalogsError } = await supabase
        .from("catalogs")
        .select("id")
        .eq("user_id", user.id);

      if (catalogsError) throw catalogsError;

      const currentCatalogCount = catalogsData?.length || 0;

      return {
        canCreateCatalog: catalogLimit === -1 || currentCatalogCount < catalogLimit,
        canAddProduct: true, // We'll check this per catalog
        productLimit,
        catalogLimit,
        currentCatalogCount,
        error: null
      };
    } catch (error: any) {
      console.error("Error getting user limits:", error);
      return { 
        canCreateCatalog: false, 
        canAddProduct: false,
        productLimit: 0,
        catalogLimit: 0,
        error: error.message 
      };
    }
  }, [user, subscription]);

  // Function to check if user can create a new catalog
  const canCreateCatalog = useCallback(async () => {
    const limits = await getUserLimits();
    
    if (limits.error) {
      toast({
        title: "Error checking limits",
        description: limits.error,
        variant: "destructive",
      });
      return false;
    }

    // If catalog limit is -1, it means unlimited catalogs
    if (limits.catalogLimit !== -1 && !limits.canCreateCatalog) {
      toast({
        title: "Subscription limit reached",
        description: `Your current plan allows for ${limits.catalogLimit} catalog${limits.catalogLimit !== 1 ? 's' : ''}. Please upgrade your plan to create more catalogs.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [getUserLimits]);

  // Function to check if user can add products to a catalog
  const canAddProductToCatalog = useCallback(async (catalogId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add products",
        variant: "destructive",
      });
      return false;
    }
    
    const limits = await getUserLimits();
    
    if (limits.error) {
      toast({
        title: "Error checking limits",
        description: limits.error,
        variant: "destructive",
      });
      return false;
    }

    // If product limit is -1, it means unlimited products
    if (limits.productLimit === -1) {
      return true;
    }

    try {
      // Get current product count for this catalog
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("catalog_id", catalogId);

      if (productsError) throw productsError;

      const currentProductCount = productsData?.length || 0;

      if (currentProductCount >= limits.productLimit) {
        toast({
          title: "Product limit reached",
          description: `Your current plan allows for ${limits.productLimit} product${limits.productLimit !== 1 ? 's' : ''} per catalog. Please upgrade your plan to add more products.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error("Error checking product limits:", error);
      toast({
        title: "Error checking product limits",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [user, getUserLimits]);

  return {
    getUserLimits,
    canCreateCatalog,
    canAddProductToCatalog
  };
}; 