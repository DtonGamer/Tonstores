import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";
import { debugLog } from "@/utils/debug";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, authInitialized, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to initialize
    if (!authInitialized) {
      debugLog("⏳ Waiting for auth to initialize");
      return;
    }

    // Once initialized, check if user exists
    if (!user) {
      debugLog("🚫 No user - redirecting to login");
      
      sessionStorage.setItem("redirectAfterLogin", location.pathname);
      
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        duration: 3000,
      });

      navigate("/login", {
        replace: true,
        state: { from: location.pathname }
      });
    } else {
      debugLog("✅ User authenticated");
    }
  }, [authInitialized, user, navigate, location.pathname]);

  // Show loading spinner while auth initializes
  if (!authInitialized || isLoading) {
    debugLog("🔄 Showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Tonstores-green"></div>
      </div>
    );
  }

  // Don't render children until we have a user
  if (!user) {
    return null;
  }

  debugLog("✅ Rendering protected content");
  return <>{children}</>;
};

// Premium route that requires a paid subscription
type PremiumRouteProps = {
  children: ReactNode;
};

export const PremiumRoute = ({ children }: PremiumRouteProps) => {
  const { user, authInitialized } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const [hasPaidPlan, setHasPaidPlan] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authInitialized || subscriptionLoading) return;

    const hasPaidSubscription = subscription && 
      subscription.pricing_plans && 
      subscription.pricing_plans.name !== 'Free' &&
      subscription.status === 'active';
    
    setHasPaidPlan(hasPaidSubscription);
  }, [authInitialized, subscription, subscriptionLoading]);

  // Show spinner while checking
  if (!authInitialized || subscriptionLoading || hasPaidPlan === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Tonstores-green"></div>
      </div>
    );
  }

  // If user doesn't have a paid plan
  if (!hasPaidPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <LockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Premium Feature</h2>
          <p className="text-gray-600 mb-6">
            This feature is available to business users only.
          </p>
          <Button 
            onClick={() => navigate("/pricing")}
            className="bg-Tonstores-green hover:bg-Tonstores-darkblue text-white"
          >
            View Pricing Plans
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;