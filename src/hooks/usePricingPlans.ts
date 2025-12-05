import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features: {
    product_limit: number;
    catalog_limit: number;
    analytics: string;
    support_level: string;
    features: string[];
  };
  is_popular: boolean;
};

export const usePricingPlans = () => {
  return useQuery({
    queryKey: ["pricing-plans"],
    queryFn: async () => {
      try {
        console.log("Attempting to fetch pricing plans...");
        const { data, error, count } = await supabase
          .from("pricing_plans")
          .select("id, name, description, monthly_price, yearly_price, features, is_popular", { count: 'exact' })
          .order("monthly_price");

        console.log("Query result - data:", data, "error:", error, "count:", count);

        if (error) {
          console.error("Error fetching pricing plans:", error);
          throw new Error(`Failed to fetch pricing plans: ${error.message}`);
        }

        // If no data returned from database, return empty array
        if (!data || data.length === 0) {
          console.log("No pricing plans found in database");
          return [];
        }

        // Map the database fields to match the PricingPlan interface
        const mappedData = data.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          monthly_price: plan.monthly_price,
          yearly_price: plan.yearly_price,
          features: plan.features,
          is_popular: plan.is_popular
        }));

        console.log("Mapped pricing plans:", mappedData);
        return mappedData as PricingPlan[];
      } catch (error) {
        console.error("Exception when fetching pricing plans:", error);
        throw new Error(`Exception when fetching pricing plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  });
}; 