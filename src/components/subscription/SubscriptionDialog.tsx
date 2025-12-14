import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingPlan } from "@/hooks/usePricingPlans";
import { useSubscription } from "@/hooks/useSubscription";
import useAuth from "@/contexts/AuthContext";
import { createMonnifyConfig } from "@/services/monnifyPayment";
import { monnifyApi } from "@/services/monnifyApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan;
  billingCycle: "monthly" | "yearly";
}

export function SubscriptionDialog({
  isOpen,
  onClose,
  plan,
  billingCycle,
}: SubscriptionDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { createSubscription, updateSubscription } = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [monnifyConfig, setMonnifyConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Define handlePaymentSuccess before it's used in useEffect
  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      setIsProcessing(true);

      // Create subscription in incomplete state
      const subscription = await createSubscription(plan.id);

      // Calculate period dates
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + (billingCycle === "monthly" ? 30 : 365));

      // Update subscription with payment details
      await updateSubscription({
        status: "active",
        payment_provider: "monnify",
        payment_provider_subscription_id: transactionId,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });

      // Force refresh subscription data
      await queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });

      toast.success("Subscription activated successfully! Your account has been upgraded.");
      onClose();

      // Reload the page to ensure all components reflect the new subscription status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error processing subscription:", error);
      toast.error(error.message || "Failed to process subscription. Please try again or contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Load Monnify config when dialog opens and plan/user is available
    const loadMonnifyConfig = async () => {
      if (!isOpen || !user || !plan) return;

      try {
        setConfigLoading(true);
        const config = await createMonnifyConfig({
          plan,
          user,
          billingCycle,
          onSuccess: handlePaymentSuccess,
          onClose,
        });
        setMonnifyConfig(config);
      } catch (error: any) {
        console.error("Error creating Monnify config:", error);
        toast.error(error.message || "Payment configuration failed. Please try again.");
        onClose();
      } finally {
        setConfigLoading(false);
      }
    };

    loadMonnifyConfig();
  }, [isOpen, plan, user, billingCycle]);

  const handleFreePlanSignup = () => {
    navigate("/auth/signup");
    onClose();
  };

  const handleEnterprisePlan = async () => {
    // Opening WhatsApp with a pre-filled message about Enterprise plan
    const whatsappMessage = encodeURIComponent(
      "Hello, I'm interested in the Enterprise pricing plan for Tonstores. Please provide more information about custom pricing and features."
    );
    
    // Get admin WhatsApp number or use default
    const getAdminWhatsApp = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('whatsapp_support')
          .eq('role', 'admin')
          .single();
          
        return data?.whatsapp_support || "+2347012345678"; // Default fallback number
      } catch (error) {
        console.error("Error getting admin WhatsApp:", error);
        return "+2347012345678"; // Default fallback number
      }
    };
    
    // Redirect to WhatsApp
    const phoneNumber = await getAdminWhatsApp();
    window.open(`https://wa.me/${phoneNumber.replace('+', '')}?text=${whatsappMessage}`, '_blank');
    navigate("/contact");
    onClose();
  };

  if (plan.name.toLowerCase() === "free") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[425px] p-4 sm:p-6 overflow-y-auto max-h-[95vh]">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl text-center sm:text-left">Get Started with Free Plan</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-center sm:text-left">
              Create your account to start using our platform for free.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 sm:py-4">
            <Button 
              onClick={handleFreePlanSignup}
              className="w-full bg-Tonstores-green text-white hover:bg-Tonstores-green/90 py-2 sm:py-2.5 h-auto text-base"
            >
              Sign Up Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (plan.name.toLowerCase() === "enterprise") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[425px] p-4 sm:p-6 overflow-y-auto max-h-[95vh]">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl text-center sm:text-left">Contact Sales</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-center sm:text-left">
              Let's discuss your enterprise needs and create a custom solution for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 sm:py-4">
            <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={handleEnterprisePlan}
                className="w-full bg-Tonstores-green text-white hover:bg-Tonstores-green/90 py-2 sm:py-2.5 h-auto text-base"
              >
                Contact Sales via WhatsApp
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full py-2 sm:py-2.5 h-auto text-base"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return null;
  }

  const initiateMonnifyPayment = async () => {
    if (!monnifyConfig) return;

    try {
      // Prepare Monnify transaction data
      const monnifyTransactionData = {
        amount: monnifyConfig.amount / 100, // Convert from kobo to naira
        currencyCode: monnifyConfig.currency,
        customerName: monnifyConfig.customerName,
        customerEmail: monnifyConfig.customerEmail,
        paymentReference: monnifyConfig.reference,
        description: monnifyConfig.description,
        callbackUrl: monnifyConfig.callbackUrl,
        metadata: monnifyConfig.metadata
      };

      const transactionData = await monnifyApi.initializeDirectTransaction(monnifyTransactionData);

      if (transactionData.status && transactionData.data?.checkoutUrl) {
        // Open the Monnify checkout page in the same window
        window.location.href = transactionData.data.checkoutUrl;
      } else {
        throw new Error(transactionData.message || 'Failed to get checkout URL from Monnify');
      }
    } catch (error: any) {
      console.error("Failed to initialize Monnify transaction:", error);
      toast.error("Payment initialization failed: " + (error.message || "Unknown error"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] p-4 sm:p-6 overflow-y-auto max-h-[95vh]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl text-center sm:text-left">Subscribe to {plan.name} Plan</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-center sm:text-left">
            You are about to subscribe to the {plan.name} plan with{" "}
            {billingCycle === "monthly" ? "monthly" : "yearly"} billing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 sm:py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-base sm:text-lg">Plan Features:</h4>
            <ul className="list-disc pl-4 sm:pl-5 space-y-2 text-sm text-gray-700">
              <li>Up to {plan.features.product_limit === -1 ? "unlimited" : plan.features.product_limit} products</li>
              <li>
                {plan.features.catalog_limit === -1
                  ? "Unlimited catalogs"
                  : `${plan.features.catalog_limit} active catalog${plan.features.catalog_limit > 1 ? "s" : ""}`}
              </li>
              <li>{plan.features.analytics}</li>
              <li>{plan.features.support_level}</li>
              {plan.features.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
            {isProcessing || configLoading ? (
              <Button disabled className="w-full py-2 sm:py-2.5 h-auto text-base">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isProcessing ? "Processing..." : "Loading..."}
              </Button>
            ) : (
              <>
                <Button
                  onClick={initiateMonnifyPayment}
                  disabled={!monnifyConfig}
                  className="w-full bg-Tonstores-green text-white hover:bg-Tonstores-green/90 py-2 sm:py-2.5 h-auto text-base"
                >
                  Pay Now
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full py-2 sm:py-2.5 h-auto text-base"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}