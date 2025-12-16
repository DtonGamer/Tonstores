import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";

import { debugLog } from "@/utils/debug";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, authInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Perform an immediate session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        debugLog("Performing direct session check");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          debugLog("Session check error:", error);
          setSessionChecked(true);
          return;
        }
        
        if (data.session) {
          debugLog("Session found directly:", !!data.session.user);
          setIsVerified(true);
        }
        
        setSessionChecked(true);
      } catch (error) {
        debugLog("Session check exception:", error);
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, []);

  // Timeout to avoid infinite loading - reduced to 1000ms
  useEffect(() => {
    const timer = setTimeout(() => {
      debugLog("⏱ Loading timeout reached");
      setLoadingTimeout(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Main auth check
  useEffect(() => {
    debugLog("Auth Initialized?", authInitialized, "Loading?", isLoading, "User?", !!user, "Timeout?", loadingTimeout, "SessionChecked?", sessionChecked);

    // Quick check - if we have a user, we're good to go
    if (user) {
      debugLog("✅ User authenticated immediately");
      setIsVerified(true);
      return;
    }

    // If auth is initialized or we've reached the timeout or session check completed
    if (authInitialized || loadingTimeout || sessionChecked || !isLoading) {
      // If no user, redirect to login
      if (!user) {
        debugLog("🚫 No user – redirecting to /login");
        // Save the current path for redirect after login
        sessionStorage.setItem("redirectAfterLogin", location.pathname);

        toast({
          title: "Authentication required",
          description: "Please log in to access this page.",
          variant: "default",
          duration: 3000,
        });

        // Use navigate with state to preserve the current location for future redirect
        navigate("/login", { 
          replace: true,
          state: { from: location.pathname }
        });
      } else {
        debugLog("✅ User authenticated after check");
        setIsVerified(true);
      }
    }
  }, [authInitialized, isLoading, loadingTimeout, user, navigate, location.pathname, sessionChecked]);

  // Show spinner only if we're still loading and haven't timed out
  const showSpinner = !isVerified && !loadingTimeout && (isLoading || !sessionChecked);
  debugLog("showSpinner =", showSpinner, "isVerified =", isVerified);

  if (showSpinner) {
    debugLog("🔄 Rendering loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Tonstores-green"></div>
      </div>
    );
  }

  debugLog("🎉 Rendering protected children");
  return <>{children}</>;
};

// Premium route that requires a paid subscription
type PremiumRouteProps = {
  children: ReactNode;
};

export const PremiumRoute = ({ children }: PremiumRouteProps) => {
  const { user, isLoading } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const [hasPaidPlan, setHasPaidPlan] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait for both auth and subscription data to load
    if (!isLoading && !subscriptionLoading) {
      // Check if the user has a valid subscription
      const hasPaidSubscription = subscription && 
        subscription.pricing_plans && 
        subscription.pricing_plans.name !== 'Free' &&
        subscription.status === 'active';
      
      setHasPaidPlan(hasPaidSubscription);
    }
  }, [user, isLoading, subscription, subscriptionLoading]);

  // Show spinner while checking
  if (isLoading || subscriptionLoading || hasPaidPlan === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Tonstores-green"></div>
      </div>
    );
  }

  // If user doesn't have a paid plan, show a message
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

  // If user has a paid plan, show the content
  return <>{children}</>;
};

export default ProtectedRoute;
