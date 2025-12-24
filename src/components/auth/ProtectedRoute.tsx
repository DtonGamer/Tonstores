import { ReactNode, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";
import { debugLog } from "@/utils/debug";
import { supabase } from "@/integrations/supabase/client";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedUserTypes?: ('buyer' | 'seller')[]; // Optional: specify which user types can access this route
};

const ProtectedRoute = ({ children, allowedUserTypes }: ProtectedRouteProps) => {
  const { user, authInitialized, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Use ref to track if we've already checked auth
  const hasCheckedAuth = useRef(false);
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Skip if already checked
    if (hasCheckedAuth.current) return;

    // Wait for auth to initialize
    if (!authInitialized) {
      debugLog("⏳ Waiting for auth to initialize");
      return;
    }

    // Once initialized, check if user exists
    if (!user) {
      debugLog("🚫 No user - redirecting to login");

      sessionStorage.setItem("redirectAfterLogin", location.pathname);

      // Only show toast once
      if (!hasShownToast.current) {
        toast({
          title: "Authentication required",
          description: "Please log in to access this page.",
          duration: 3000,
        });
        hasShownToast.current = true;
      }

      navigate("/login", {
        replace: true,
        state: { from: location.pathname }
      });

      hasCheckedAuth.current = true;
    } else {
      debugLog("✅ User authenticated");
      hasCheckedAuth.current = true;
    }
  }, [authInitialized, user, navigate, location.pathname]);

  // Fetch user profile to determine user type
  useEffect(() => {
    if (!user || !authInitialized || !hasCheckedAuth.current) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (error) {
          debugLog("❌ Error fetching profile:", error.message);
          // If profile doesn't exist yet, default to seller for backward compatibility
          setUserType('seller');
        } else {
          setUserType(profile.user_type || 'seller');
        }
      } catch (err) {
        debugLog("❌ Error in fetchProfile:", err);
        setUserType('seller'); // Default to seller on error
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, authInitialized]);

  // Check if user type is allowed for this route
  useEffect(() => {
    if (!userType || !allowedUserTypes || profileLoading) return;

    if (!allowedUserTypes.includes(userType)) {
      debugLog(`❌ User type ${userType} not allowed for this route`);

      // Redirect based on user type
      if (userType === 'buyer') {
        // Buyers should only go to their profile page
        navigate("/buyer-profile", { replace: true });
      } else {
        // Sellers can go to dashboard
        navigate("/dashboard", { replace: true });
      }
    }
  }, [userType, allowedUserTypes, profileLoading, navigate]);

  // Show loading spinner while auth initializes
  if (!authInitialized || isLoading || profileLoading) {
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

  // If allowedUserTypes is specified but user type doesn't match, don't render
  if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
    return null;
  }

  debugLog("✅ Rendering protected content");
  return <>{children}</>;
};

// Premium route that requires a paid subscription
type PremiumRouteProps = {
  children: ReactNode;
  allowedUserTypes?: ('buyer' | 'seller')[]; // Optional: specify which user types can access this route
};

export const PremiumRoute = ({ children, allowedUserTypes }: PremiumRouteProps) => {
  const { user, authInitialized, isLoading } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const [hasPaidPlan, setHasPaidPlan] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Use ref to prevent re-checking
  const hasCheckedSubscription = useRef(false);

  // Fetch user profile to determine user type
  useEffect(() => {
    if (!user || !authInitialized) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (error) {
          debugLog("❌ Error fetching profile:", error.message);
          // If profile doesn't exist yet, default to seller for backward compatibility
          setUserType('seller');
        } else {
          setUserType(profile.user_type || 'seller');
        }
      } catch (err) {
        debugLog("❌ Error in fetchProfile:", err);
        setUserType('seller'); // Default to seller on error
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, authInitialized]);

  useEffect(() => {
    // Skip if already checked
    if (hasCheckedSubscription.current) return;

    if (!authInitialized || subscriptionLoading || profileLoading) return;

    const hasPaidSubscription = subscription &&
      subscription.pricing_plans &&
      subscription.pricing_plans.name !== 'Free' &&
      subscription.status === 'active';

    setHasPaidPlan(hasPaidSubscription);
    hasCheckedSubscription.current = true;
  }, [authInitialized, subscription, subscriptionLoading, profileLoading]);

  // Check if user type is allowed for this route
  useEffect(() => {
    if (!userType || !allowedUserTypes || profileLoading) return;

    if (!allowedUserTypes.includes(userType)) {
      debugLog(`❌ User type ${userType} not allowed for this route`);

      // Redirect based on user type
      if (userType === 'buyer') {
        // Buyers should only go to their profile page
        navigate("/buyer-profile", { replace: true });
      } else {
        // Sellers can go to dashboard
        navigate("/dashboard", { replace: true });
      }
    }
  }, [userType, allowedUserTypes, profileLoading, navigate]);

  // Show spinner while checking
  if (!authInitialized || isLoading || subscriptionLoading || profileLoading || hasPaidPlan === null) {
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

  // If allowedUserTypes is specified but user type doesn't match, don't render
  if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
    return null;
  }

  // If user doesn't have a paid plan
  if (!hasPaidPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <LockIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Premium Feature</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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