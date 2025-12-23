import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingPlan } from "@/hooks/usePricingPlans";
import { useSubscription } from "@/hooks/useSubscription";
import useAuth from "@/contexts/AuthContext";
import { createPaystackConfig } from "@/services/PaystackPayment";
import { unifiedPaystackService } from "@/services/UnifiedPaystackService";
import { toast } from "sonner";
import { Loader2, Check, X, MessageCircle, Shield, Zap, TrendingUp, CreditCard, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [paystackConfig, setPaystackConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const handlePaymentSuccess = useCallback(async (transactionId: string) => {
    try {
      setIsProcessing(true);

      const subscription = await createSubscription(plan.id);

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + (billingCycle === "monthly" ? 30 : 365));

      await updateSubscription({
        status: "active",
        payment_provider: "paystack",
        payment_provider_subscription_id: transactionId,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });

      await queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });

      toast.success("🎉 Subscription activated! Your account has been upgraded.");
      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error processing subscription:", error);
      toast.error(error.message || "Failed to process subscription. Please try again or contact support.");
    } finally {
      setIsProcessing(false);
    }
  }, [createSubscription, plan.id, billingCycle, updateSubscription, queryClient, user?.id, onClose]);

  useEffect(() => {
    const loadPaystackConfig = async () => {
      if (!isOpen || !user || !plan) return;

      try {
        setConfigLoading(true);
        const config = await createPaystackConfig({
          plan,
          user,
          billingCycle,
          onSuccess: handlePaymentSuccess,
          onClose,
        });
        setPaystackConfig(config);
      } catch (error: any) {
        console.error("Error creating Paystack config:", error);
        toast.error(error.message || "Payment configuration failed. Please try again.");
        onClose();
      } finally {
        setConfigLoading(false);
      }
    };

    loadPaystackConfig();
  }, [isOpen, plan, user, billingCycle, handlePaymentSuccess]);

  const handleFreePlanSignup = () => {
    navigate("/auth/signup");
    onClose();
  };

  const handleEnterprisePlan = async () => {
    const whatsappMessage = encodeURIComponent(
      "Hello, I'm interested in the Enterprise pricing plan for Tonstores. Please provide more information about custom pricing and features."
    );
    
    const getAdminWhatsApp = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('whatsapp_support')
          .eq('role', 'admin')
          .single();
          
        return data?.whatsapp_support || "+2347012345678";
      } catch (error) {
        console.error("Error getting admin WhatsApp:", error);
        return "+2347012345678";
      }
    };
    
    const phoneNumber = await getAdminWhatsApp();
    window.open(`https://wa.me/${phoneNumber.replace('+', '')}?text=${whatsappMessage}`, '_blank');
    onClose();
  };

  // Helper function to format price correctly (convert from kobo to Naira)
  const formatPrice = (priceInKobo: number) => {
    const priceInNaira = priceInKobo / 100;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(priceInNaira);
  };

  // Calculate savings percentage
  const calculateSavings = () => {
    if (billingCycle === "yearly" && plan.monthly_price > 0 && plan.yearly_price > 0) {
      const monthlyTotal = plan.monthly_price * 12;
      const savings = ((monthlyTotal - plan.yearly_price) / monthlyTotal) * 100;
      return Math.round(savings);
    }
    return 0;
  };

  // Free Plan Dialog
  if (plan.name.toLowerCase() === "free") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 flex-shrink-0">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <Zap className="h-4 w-4 text-Tonstores-green" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">
                  FREE FOREVER
                </Badge>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                {plan.name} Plan
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {plan.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 px-4 sm:px-6">
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Products</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {plan.features.product_limit === -1 ? "Unlimited" : plan.features.product_limit}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Catalogs</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {plan.features.catalog_limit === -1 ? "Unlimited" : plan.features.catalog_limit}
                </Badge>
              </div>

              <div className="grid gap-2 mt-3">
                {plan.features.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t flex-shrink-0 space-y-3">
            <Button 
              onClick={handleFreePlanSignup}
              className="w-full bg-Tonstores-green text-white hover:bg-Tonstores-green/90 h-11 text-base font-semibold"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              No credit card • {plan.features.support_level}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Enterprise Plan Dialog
  if (plan.name.toLowerCase() === "enterprise") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 flex-shrink-0">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <Badge className="bg-purple-600 hover:bg-purple-700 text-xs font-semibold">
                  ENTERPRISE
                </Badge>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                {plan.name} Plan
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {plan.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 px-4 sm:px-6">
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Products</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {plan.features.product_limit === -1 ? "Unlimited" : plan.features.product_limit}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Catalogs</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {plan.features.catalog_limit === -1 ? "Unlimited" : plan.features.catalog_limit}
                </Badge>
              </div>

              <div className="grid gap-2 mt-3">
                {plan.features.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-0.5 bg-purple-100 rounded-full flex-shrink-0">
                      <Check className="h-3 w-3 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t flex-shrink-0 space-y-3">
            <Button 
              onClick={handleEnterprisePlan}
              className="w-full bg-purple-600 text-white hover:bg-purple-700 h-11 text-base font-semibold"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Sales Team
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-10 text-sm"
            >
              Maybe Later
            </Button>

            <p className="text-xs text-center text-gray-500">
              {plan.features.support_level} • Custom pricing
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return null;
  }

  const initiatePaystackPayment = async () => {
    if (!paystackConfig) return;

    try {
      const paystackTransactionData = {
        amount: paystackConfig.amount,
        email: paystackConfig.customerEmail,
        currency: paystackConfig.currency,
        reference: paystackConfig.reference,
        callbackUrl: paystackConfig.callbackUrl,
        metadata: paystackConfig.metadata,
        dev_mode: false
      };

      const transactionData = await unifiedPaystackService.initializeTransaction(paystackTransactionData);

      if (transactionData.status && (transactionData.data?.authorization_url || transactionData.data?.authorizationUrl)) {
        const authUrl = transactionData.data?.authorizationUrl || transactionData.data?.authorization_url;
        window.location.href = authUrl;
      } else if (transactionData.status && transactionData.data?.access_code) {
        const PaystackPop = (window as any).PaystackPop;
        if (!PaystackPop) {
          console.error("Paystack script not loaded");
          toast.error("Payment system is not ready, please try again");
          return;
        }

        const handler = PaystackPop.setup({
          key: paystackConfig.publicKey,
          email: paystackConfig.customerEmail,
          amount: paystackConfig.amount,
          currency: paystackConfig.currency,
          ref: paystackConfig.reference,
          metadata: paystackConfig.metadata,
          channels: ['card', 'bank', 'ussd'],
          onSuccess: (transaction: any) => {
            handlePaymentSuccess(transaction.reference);
          },
          onClose: () => {
            console.log("Payment window closed by user");
          },
        });

        handler.openIframe();
      } else {
        throw new Error(transactionData.message || 'Failed to get checkout URL from Paystack');
      }
    } catch (error: any) {
      console.error("Failed to initialize Paystack transaction:", error);
      toast.error("Payment initialization failed: " + (error.message || "Unknown error"));
    }
  };

  // Calculate pricing
  const price = billingCycle === "monthly" ? plan.monthly_price : plan.yearly_price;
  const formattedPrice = formatPrice(price);
  const savings = calculateSavings();

  // Paid Plan Dialog (Pro, Business, etc.)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-6 flex-shrink-0">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                <Shield className="h-4 w-4 text-Tonstores-green" />
              </div>
              {plan.is_popular && (
                <Badge className="bg-Tonstores-green hover:bg-Tonstores-green/90 text-xs font-semibold">
                  POPULAR
                </Badge>
              )}
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              {plan.name} Plan
            </DialogTitle>

            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                {formattedPrice}
              </span>
              <span className="text-base text-gray-600">
                /{billingCycle === "monthly" ? "mo" : "yr"}
              </span>
            </div>

            {savings > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                Save {savings}% yearly
              </div>
            )}

            <DialogDescription className="text-sm text-gray-600 line-clamp-2">
              {plan.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Features */}
        <ScrollArea className="flex-1 px-4 sm:px-6">
          <div className="space-y-4 py-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Products</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {plan.features.product_limit === -1 ? "Unlimited" : plan.features.product_limit}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Catalogs</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {plan.features.catalog_limit === -1 ? "Unlimited" : plan.features.catalog_limit}
                </Badge>
              </div>

              <Separator className="my-2" />

              <div className="grid gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{plan.features.analytics}</span>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{plan.features.support_level}</span>
                </div>

                {plan.features.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-2.5 bg-blue-50 rounded-lg">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                Secure payment via Paystack
              </span>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t flex-shrink-0 space-y-3">
          {isProcessing || configLoading ? (
            <Button 
              disabled 
              className="w-full h-11 text-base font-semibold bg-Tonstores-green"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isProcessing ? "Processing..." : "Loading..."}
            </Button>
          ) : (
            <>
              <Button
                onClick={initiatePaystackPayment}
                disabled={!paystackConfig}
                className="w-full bg-Tonstores-green text-white hover:bg-Tonstores-green/90 h-11 text-base font-semibold"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Continue to Payment
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-10 text-sm"
              >
                Not Now
              </Button>
            </>
          )}

          <p className="text-xs text-center text-gray-500 leading-relaxed">
            Cancel anytime • Secure checkout
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}