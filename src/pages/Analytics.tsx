import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  LockIcon,
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { SalesCards } from "@/components/analytics/SalesCards";
import { SalesChart } from "@/components/analytics/SalesChart";
import { ProductPerformance } from "@/components/analytics/ProductPerformance";
import { CustomerInsights } from "@/components/analytics/CustomerInsights";
import { PaymentStatusBreakdown } from "@/components/analytics/PaymentStatusBreakdown";
import { SocialMediaInsights } from "@/components/analytics/SocialMediaInsights";
import { useSubscription } from "@/hooks/useSubscription";

const Analytics = () => {
  const {
    salesSummary,
    salesOverTime,
    topProducts,
    customerInsights,
    socialMediaStats,
    loading,
    error,
    refreshData,
  } = useAnalytics();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("sales");
  const { subscription } = useSubscription();

  // Check if user is on a free plan (no subscription or free plan)
  const isFreePlan = !subscription || 
    (subscription.pricing_plans && subscription.pricing_plans.name === "Free");

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const toggleSection = (section: string) => {
    // Don't allow expanding locked sections for free users
    if (isFreePlan && section !== "sales") {
      return;
    }
    
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  if (loading) return <LoadingState text="Loading analytics data..." fullPage />;
  if (error)
    return (
      <ErrorMessage
        message={error}
        title="Error Loading Analytics"
        onRetry={refreshData}
        retryText="Try Again"
      />
    );

  // Pie chart data
  const customerData = [
    {
      name: "New Customers",
      value: customerInsights
        ? customerInsights.totalCustomers - customerInsights.returningCustomers
        : 0,
    },
    { name: "Returning Customers", value: customerInsights?.returningCustomers || 0 },
  ];

  const SectionHeader = ({ title, id, children }: { title: string, id: string, children?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleSection(id)}>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
        {title}
        {children}
      </h2>
      {isFreePlan && id !== "sales" ? (
        <div className="flex items-center">
          <LockIcon className="h-5 w-5 text-amber-500 mr-2" />
          <span className="text-sm text-amber-500">Premium Feature</span>
        </div>
      ) : (
        expandedSection === id ? (
          <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )
      )}
    </div>
  );

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Track your store performance and customer engagement</p>
        </div>
        <Button
          className="mt-4 sm:mt-0"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      {/* Key metrics cards */}
      <div className="mb-8">
      <SalesCards salesSummary={salesSummary} />
      </div>
      
      {/* Sales Performance */}
      <div className="mb-8">
        <SectionHeader title="Sales Performance" id="sales" />
        {(expandedSection === "sales" || expandedSection === null) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 overflow-hidden">
          <SalesChart
            salesOverTime={salesOverTime}
              error={error || undefined}
            onRetry={refreshData}
          />
          </div>
        )}
      </div>
      
      {/* Top Products & Channels */}
      <div className="mb-8">
        <SectionHeader title="Top Products & Channels" id="products" />
        {expandedSection === "products" && !isFreePlan && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 overflow-hidden">
              <ProductPerformance topProducts={topProducts} />
            </div>
        
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 overflow-hidden">
              <SocialMediaInsights socialMediaStats={socialMediaStats} />
            </div>
          </div>
        )}
        {expandedSection === "products" && isFreePlan && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg text-center">
            <LockIcon className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300 mb-2">Premium Feature</h3>
            <p className="text-amber-700 dark:text-amber-400 mb-4">Upgrade your subscription to access detailed product analytics and channel performance.</p>
            <Button 
              variant="outline" 
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
              onClick={() => window.location.href = '/pricing'}
            >
              View Pricing Plans
            </Button>
          </div>
        )}
      </div>
      
      {/* Customer Insights */}
      <div className="mb-8">
        <SectionHeader title="Customer & Payment Insights" id="customers" />
        {expandedSection === "customers" && !isFreePlan && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
              <CustomerInsights customerInsights={customerInsights} />
            </div>
            <PaymentStatusBreakdown salesSummary={salesSummary} />
          </div>
        )}
        {expandedSection === "customers" && isFreePlan && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg text-center">
            <LockIcon className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300 mb-2">Premium Feature</h3>
            <p className="text-amber-700 dark:text-amber-400 mb-4">Upgrade your subscription to access detailed customer insights and payment analytics.</p>
            <Button 
              variant="outline" 
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
              onClick={() => window.location.href = '/pricing'}
            >
              View Pricing Plans
            </Button>
          </div>
        )}
      </div>
      
      {/* Interactive Dashboard Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setExpandedSection("sales")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales Overview</CardTitle>
            <CardDescription>Track sales performance over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
              <span>View Sales Chart</span>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-md transition-shadow ${isFreePlan ? 'opacity-70' : ''}`}
          onClick={() => toggleSection("products")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Products & Channels</CardTitle>
            <CardDescription>View top performers and traffic sources</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
              {isFreePlan && <LockIcon className="h-4 w-4 mr-1 text-amber-500" />}
              <span>View Product Analytics</span>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-md transition-shadow ${isFreePlan ? 'opacity-70' : ''}`}
          onClick={() => toggleSection("customers")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Customer Insights</CardTitle>
            <CardDescription>Analyze customer behavior and payments</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
              {isFreePlan && <LockIcon className="h-4 w-4 mr-1 text-amber-500" />}
              <span>View Customer Data</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isFreePlan && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-950/30 dark:to-amber-950/30 p-6 rounded-lg text-center shadow-sm border border-blue-100 dark:border-blue-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unlock All Analytics Features</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Upgrade your plan to access comprehensive analytics including product performance, 
            customer insights, and more advanced metrics to grow your business.
          </p>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default Analytics;
