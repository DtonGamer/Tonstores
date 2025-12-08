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
      
      {/* Compact Analytics Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full"
          onClick={() => setExpandedSection("sales")}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <CardTitle className="text-lg">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <CardDescription className="mb-4">
              Track sales performance over time
            </CardDescription>
            <Button variant="outline" size="sm" className="w-fit">
              View Chart
            </Button>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full ${isFreePlan ? 'opacity-70' : ''}`}
          onClick={() => toggleSection("products")}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <CardTitle className="text-lg">Products & Channels</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <CardDescription className="mb-4">
              View top performers and traffic sources
            </CardDescription>
            {isFreePlan && <LockIcon className="h-4 w-4 text-amber-500 mb-4" />}
            <Button
              variant="outline"
              size="sm"
              className={`w-fit ${isFreePlan ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFreePlan}
            >
              {isFreePlan ? 'Premium' : 'View Data'}
            </Button>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full ${isFreePlan ? 'opacity-70' : ''}`}
          onClick={() => toggleSection("customers")}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.036-.687-.101-1.016A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
            <CardTitle className="text-lg">Customer Insights</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <CardDescription className="mb-4">
              Analyze customer behavior and payments
            </CardDescription>
            {isFreePlan && <LockIcon className="h-4 w-4 text-amber-500 mb-4" />}
            <Button
              variant="outline"
              size="sm"
              className={`w-fit ${isFreePlan ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFreePlan}
            >
              {isFreePlan ? 'Premium' : 'View Data'}
            </Button>
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
