import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, ListCheck, CreditCard, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import { refreshSession } from "@/utils/reconnectHandler";
import { SubscriptionDialog } from "@/components/subscription/SubscriptionDialog";
import { usePricingPlans } from "@/hooks/usePricingPlans";

type Catalog = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { subscription } = useSubscription();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [subscriptionLimits, setSubscriptionLimits] = useState<any>(null);
  const [productsCount, setProductsCount] = useState<Record<string, number>>({});
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { getUserLimits } = useSubscriptionLimits();
  const navigate = useNavigate();

  const { data: pricingPlans = [] } = usePricingPlans();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // console.log('Dashboard - Initial Render');
  // console.log('User:', user);
  // console.log('Profile:', profile);
  // console.log('Subscription:', subscription);

  // Memoize getUserLimits to prevent it from changing on every render
  const stableGetUserLimits = useMemo(() => getUserLimits, [getUserLimits]);

  // Fetch subscription limits only once when user changes
  useEffect(() => {
    const fetchLimits = async () => {
      if (user) {
        // console.log('Fetching subscription limits...');
        const limits = await stableGetUserLimits();
        // console.log('Subscription limits:', limits);
        setSubscriptionLimits(limits);
      }
    };

    fetchLimits();
  }, [user, stableGetUserLimits]); // Removed subscription from dependencies to prevent infinite loop

  // Consolidated data fetching function
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all data in parallel
      const [catalogsResult, orderCountResult] = await Promise.all([
        // Fetch catalogs
        supabase
          .from("catalogs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        // Fetch order count
        (async () => {
          const { data: userCatalogs } = await supabase
            .from("catalogs")
            .select("id")
            .eq("user_id", user.id);

          if (!userCatalogs || userCatalogs.length === 0) return { count: 0 };

          const catalogIds = userCatalogs.map(c => c.id);
          const { count } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .in("catalog_id", catalogIds);

          return { count: count || 0 };
        })()
      ]);

      if (catalogsResult.error) throw catalogsResult.error;

      const catalogData = catalogsResult.data || [];
      setCatalogs(catalogData);
      setOrderCount(orderCountResult.count);

      // Fetch product counts in parallel
      if (catalogData.length > 0) {
        const countPromises = catalogData.map(catalog =>
          supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("catalog_id", catalog.id)
            .then(({ count }) => ({ id: catalog.id, count: count || 0 }))
        );

        const counts = await Promise.all(countPromises);
        const countsMap = counts.reduce((acc, { id, count }) => {
          acc[id] = count;
          return acc;
        }, {} as Record<string, number>);

        setProductsCount(countsMap);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    // console.log('Dashboard state update:');
    // console.log('- Catalogs:', catalogs);
    // console.log('- Products count:', productsCount);
    // console.log('- Order count:', orderCount);
    // console.log('- Subscription limits:', subscriptionLimits);
    // console.log('- Loading:', loading);
    // console.log('- Profile loading:', profileLoading);
  }, [catalogs, productsCount, orderCount, subscriptionLimits, loading, profileLoading]);

  const toggleCatalogStatus = async (id: string, currentStatus: boolean) => {
    // console.log(`Toggling catalog ${id} status from ${currentStatus} to ${!currentStatus}`);
    try {
      const { error } = await supabase
        .from("catalogs")
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      
      if (error) throw error;
      
      setCatalogs(catalogs.map(catalog => 
        catalog.id === id ? { ...catalog, is_active: !currentStatus } : catalog
      ));
      
      // console.log(`Catalog ${id} status updated successfully`);
      toast({
        title: "Catalog updated",
        description: `Catalog ${!currentStatus ? "activated" : "deactivated"} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating catalog status:', error);
      toast({
        title: "Error updating catalog",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Add visibility change handler - only reload after long absence
  useEffect(() => {
    let wasHidden = false;
    let lastVisibleTime = Date.now();
    const VISIBILITY_THRESHOLD = 10 * 60 * 1000; // 10 minutes

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
        lastVisibleTime = Date.now();
      } else if (wasHidden) {
        const hiddenDuration = Date.now() - lastVisibleTime;

        if (hiddenDuration > VISIBILITY_THRESHOLD) {
          await refreshSession();
          await fetchDashboardData();
        }

        wasHidden = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchDashboardData]);


  if (loading || profileLoading) {
    // console.log('Dashboard is loading...');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-Tonstores-green" />
      </div>
    );
  }

  // console.log('Dashboard rendering with data');
  return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {profile?.business_name || "Seller"}!</h1>
        <p className="text-gray-600">Manage your catalogs and view your orders.</p>
      </div>
      
      {/* Low Stock Alerts */}
      {catalogs.length > 0 && catalogs.map(catalog => (
        <LowStockAlert key={`stock-alert-${catalog.id}`} catalogId={catalog.id} />
      ))}
      
      {/* Subscription Information */}
      {subscriptionLimits && (
        <Card className="border-Tonstores-green dark:border-Tonstores-green/70">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4 dark:text-gray-300" />
                <span className="text-sm font-medium dark:text-white">Plan: {subscription?.pricing_plans?.name || "Free"}</span>
              </div>
              {!subscriptionLimits.canCreateCatalog && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-Tonstores-green text-Tonstores-green hover:bg-Tonstores-green/10 dark:border-Tonstores-green/70 dark:text-Tonstores-green/90 dark:hover:bg-Tonstores-green/20"
                  onClick={() => {
                    const plan = pricingPlans.find(p => p.name !== "Free");
                    if (plan) {
                      setSelectedPlan(plan);
                      setIsSubscriptionModalOpen(true);
                    }
                  }}
                >
                  Upgrade
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Catalogs: {catalogs.length}/{subscriptionLimits.catalogLimit === -1 ? "∞" : subscriptionLimits.catalogLimit}</span>
                  <span>{subscriptionLimits.catalogLimit === -1 ? "-" : Math.round((catalogs.length / subscriptionLimits.catalogLimit) * 100) + "%"}</span>
                </div>
                <Progress 
                  value={subscriptionLimits.catalogLimit === -1 ? 0 : (catalogs.length / subscriptionLimits.catalogLimit) * 100} 
                  className="h-1.5" 
                />
              </div>
              
              {/* Show only one combined progress bar for all products across catalogs */}
              {catalogs.length > 0 && (
                <div>
                  {catalogs.map(catalog => (
                    <div key={catalog.id} className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <span className="truncate max-w-[200px]">{catalog.name}:</span>
                      <span>{productsCount[catalog.id] || 0}/{subscriptionLimits.productLimit === -1 ? "∞" : subscriptionLimits.productLimit}</span>
                      <Progress 
                        value={subscriptionLimits.productLimit === -1 ? 0 : ((productsCount[catalog.id] || 0) / subscriptionLimits.productLimit) * 100} 
                        className="h-1.5 w-16 ml-1" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card className="flex flex-col sm:flex-row items-center p-4 sm:p-6 bg-gradient-to-br from-Tonstores-lightgreen to-Tonstores-green shadow-sm dark:from-Tonstores-green/80 dark:to-Tonstores-darkgreen">
    <div className="text-black dark:text-white flex-1 text-center sm:text-left mb-3 sm:mb-0">
      <h2 className="text-base sm:text-lg font-semibold mb-1">New Catalog</h2>
      <p className="text-black dark:text-white/80 text-xs sm:text-sm opacity-90">Create a product catalog</p>
    </div>
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
      <Link to="/onboarding" className="w-full sm:w-auto">
        <Button
          className="bg-white text-Tonstores-darkgreen hover:bg-gray-100 dark:bg-gray-800 dark:text-Tonstores-green dark:hover:bg-gray-700 flex items-center justify-center h-10 px-3 w-full"
          disabled={subscriptionLimits && !subscriptionLimits.canCreateCatalog}
        >
          <Plus size={14} className="mr-1" />
          <span className="text-xs sm:text-sm whitespace-nowrap">Quick Start</span>
        </Button>
      </Link>
      <Link to="/catalog/new" className="w-full sm:w-auto">
        <Button
          variant="outline"
          className="text-Tonstores-darkgreen hover:bg-Tonstores-lightgreen dark:text-Tonstores-green dark:hover:bg-gray-700 border dark:border-gray-600 h-10 px-3 w-full"
          disabled={subscriptionLimits && !subscriptionLimits.canCreateCatalog}
        >
          <span className="text-xs sm:text-sm whitespace-nowrap">Advanced</span>
        </Button>
      </Link>
    </div>
  </Card>

  <Card className="flex flex-col sm:flex-row items-center p-4 sm:p-6 bg-gradient-to-br from-Tonstores-lightblue to-Tonstores-blue shadow-sm dark:from-Tonstores-blue/80 dark:to-Tonstores-darkblue">
    <div className="text-black dark:text-white flex-1 text-center sm:text-left mb-3 sm:mb-0">
      <h2 className="text-base sm:text-lg font-semibold mb-1">Orders</h2>
      <p className="text-black dark:text-white/80 text-xs sm:text-sm opacity-90 text-center sm:text-left">
        You have {orderCount === null ? "..." : orderCount} order{orderCount !== 1 ? "s" : ""}
      </p>
    </div>
    <Link to="/orders" className="w-full sm:w-auto">
      <Button className="bg-white text-Tonstores-darkblue hover:bg-gray-100 dark:bg-gray-800 dark:text-Tonstores-lightblue dark:hover:bg-gray-700 flex items-center justify-center h-10 px-3 w-full">
        <ListCheck size={14} className="mr-1" />
        <span className="text-xs sm:text-sm whitespace-nowrap">View</span>
      </Button>
    </Link>
  </Card>
</div>


      <h2 className="text-xl font-semibold mt-8 dark:text-white">Your Catalogs</h2>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-Tonstores-green" />
        </div>
      ) : catalogs.length === 0 ? (
        <Card className="p-6 sm:p-12 text-center dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-medium mb-2 dark:text-white">No catalogs yet</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:mb-6 mb-4">Create your first catalog to get started</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button className="bg-Tonstores-green hover:bg-Tonstores-darkblue flex items-center gap-2 w-full sm:w-auto">
                <Plus size={16} className="sm:size-5" />
                <span className="text-xs sm:text-sm">Quick Setup</span>
              </Button>
            </Link>
            <Link to="/catalog/new" className="w-full sm:w-auto">
              <Button variant="outline" className="dark:border-gray-600 w-full sm:w-auto">
                <span className="text-xs sm:text-sm">Advanced</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {catalogs.map((catalog) => (
            <div 
              key={catalog.id} 
              className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                    <h3 className="text-lg font-medium dark:text-white">{catalog.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{catalog.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
                      <span className={`text-sm px-2 py-1 rounded ${
                        catalog.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {catalog.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Created: {new Date(catalog.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-sm flex items-center gap-1 dark:text-gray-300">
                        <Package className="h-3 w-3" />
                        Products: {productsCount[catalog.id] || 0}/{subscriptionLimits?.productLimit === -1 ? "∞" : subscriptionLimits?.productLimit || "∞"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 self-start">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleCatalogStatus(catalog.id, catalog.is_active)}
                      className="whitespace-nowrap dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {catalog.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Link to={`/catalog/${catalog.id}/edit`}>
                      <Button size="sm" className="whitespace-nowrap bg-Tonstores-green hover:bg-Tonstores-darkblue text-white">Edit</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
   

    {/* Subscription Modal */}
    {selectedPlan && (
      <SubscriptionDialog
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        plan={selectedPlan}
        billingCycle={billingCycle}
      />
    )}
  </div>
)};

export default Dashboard;
