import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "@/types/subscription";
import useAuth from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useMemo } from "react";

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, pricing_plans(*)")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No subscription found
        throw error;
      }

      return data as Subscription & { pricing_plans: any };
    },
    enabled: !!user?.id,
  });

  const { mutateAsync: createSubscription } = useMutation({
    mutationFn: async (planId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Create a pending subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: "incomplete" as const,
          payment_provider: null,
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      return subscription as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
    onError: (error) => {
      toast.error("Failed to create subscription");
      console.error("Subscription creation error:", error);
    },
  });

  const { mutateAsync: updateSubscription } = useMutation({
    mutationFn: async (updates: Partial<Subscription>) => {
      if (!subscription?.id) throw new Error("No active subscription");

      const { data, error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", subscription.id)
        .select()
        .single();

      if (error) throw error;

      return data as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
    onError: (error) => {
      toast.error("Failed to update subscription");
      console.error("Subscription update error:", error);
    },
  });

  const { mutateAsync: cancelSubscription } = useMutation({
    mutationFn: async () => {
      if (!subscription?.id) throw new Error("No active subscription");

      const { data, error } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled" as const,
          cancel_at_period_end: true,
        })
        .eq("id", subscription.id)
        .select()
        .single();

      if (error) throw error;

      return data as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
      toast.success("Subscription canceled successfully");
    },
    onError: (error) => {
      toast.error("Failed to cancel subscription");
      console.error("Subscription cancellation error:", error);
    },
  });

  // Use useMemo to prevent returning new objects on each render
  return useMemo(() => ({
    subscription,
    isLoading,
    error,
    createSubscription,
    updateSubscription,
    cancelSubscription,
  }), [
    subscription,
    isLoading,
    error,
    createSubscription,
    updateSubscription,
    cancelSubscription
  ]);
}; 