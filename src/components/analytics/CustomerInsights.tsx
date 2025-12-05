import { CustomerInsight } from "@/hooks/useAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowUpRight, ArrowDownRight, Maximize2, Minimize2 } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Custom colors for charts (WhatsApp inspired)
const COLORS = ['#25D366', '#075E54', '#34B7F1', '#128C7E', '#ECE5DD'];

// Format percentage with + or - sign
const formatPercentage = (value: number | undefined) => {
  if (value === undefined) return "0%";
  return `${value > 0 ? '+' : ''}${Math.round(value)}%`;
};

type CustomerInsightsProps = {
  customerInsights: CustomerInsight | null;
};

export function CustomerInsights({ customerInsights }: CustomerInsightsProps) {
  // Create data for customer pie chart
  const customerData = [
    { 
      name: 'New Customers', 
      value: customerInsights?.totalCustomers 
        ? customerInsights.totalCustomers - customerInsights.returningCustomers 
        : 0 
    },
    { 
      name: 'Returning Customers', 
      value: customerInsights?.returningCustomers || 0 
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Customer Insights</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Key metrics about your customer base
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Always display horizontally, with responsive width adjustments */}
        <div className="flex flex-row gap-4 items-start">
          {/* Chart width adjusted for better responsive behavior */}
          <div className="w-1/3 min-w-[120px]">
            <CustomerPieChart customerData={customerData} customerInsights={customerInsights} />
          </div>
          <div className="flex-1">
            <CustomerMetrics customerInsights={customerInsights} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type CustomerPieChartProps = {
  customerData: { name: string; value: number }[];
  customerInsights: CustomerInsight | null;
};

function CustomerPieChart({ customerData, customerInsights }: CustomerPieChartProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Component to render chart content
  const ChartContent = () => (
    <>
      {customerInsights ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={customerData}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 35 : 50}
              outerRadius={isMobile ? 60 : 80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
            >
              {customerData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No customer data available yet.</p>
        </div>
      )}
    </>
  );
  
  // Render the full-screen modal when in full-screen mode
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Customer Overview</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">New vs. returning customers</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleFullScreen}
            className="mr-1 dark:text-gray-300 dark:hover:text-white"
          >
            <Minimize2 size={20} />
          </Button>
        </div>
        <div className="flex-grow p-4">
          <div className="h-full w-full">
            <ChartContent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-tonstores-blue" />
            Customer Distribution
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            New vs Returning Customers
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleFullScreen}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white h-7 w-7 p-0"
        >
          {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px] w-full">
          <ChartContent />
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerMetrics({ customerInsights }: CustomerInsightsProps) {
  // Get percentage changes or default to 0
  const totalCustomersChange = customerInsights?.percentChanges?.totalCustomers ?? 0;
  const returningRateChange = customerInsights?.percentChanges?.returningRate ?? 0;
  const avgItemsChange = customerInsights?.percentChanges?.averageItemsPerOrder ?? 0;
  
  // Calculate returning rate percentage
  const returningRate = customerInsights?.totalCustomers 
    ? Math.round((customerInsights.returningCustomers / customerInsights.totalCustomers) * 100)
    : 0;
    
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Total Customers</p>
          <h3 className="text-lg sm:text-2xl font-bold dark:text-white">{customerInsights?.totalCustomers || 0}</h3>
          <div className={`mt-2 text-xs sm:text-sm ${totalCustomersChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
            {totalCustomersChange >= 0 ? (
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            )}
            {formatPercentage(totalCustomersChange)}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Returning Rate</p>
          <h3 className="text-lg sm:text-2xl font-bold dark:text-white">
            {returningRate}%
          </h3>
          <div className={`mt-2 text-xs sm:text-sm ${returningRateChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
            {returningRateChange >= 0 ? (
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            )}
            {formatPercentage(returningRateChange)}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Items</p>
          <h3 className="text-lg sm:text-2xl font-bold dark:text-white">
            {customerInsights?.averageItemsPerOrder.toFixed(1) || 0}
          </h3>
          <div className={`mt-2 text-xs sm:text-sm ${avgItemsChange > 0 ? 'text-green-600 dark:text-green-400' : avgItemsChange < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'} flex items-center`}>
            {avgItemsChange > 0 ? (
              <><ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />{formatPercentage(avgItemsChange)}</>
            ) : avgItemsChange < 0 ? (
              <><ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />{formatPercentage(avgItemsChange)}</>
            ) : (
              <>0%</>
            )}
          </div>
        </div>
      </div>
      
      <CustomerRecommendations customerInsights={customerInsights} />
    </div>
  );
}

function CustomerRecommendations({ customerInsights }: CustomerInsightsProps) {
  return (
    <div className="mt-6 p-4 bg-tonstores-lightgray dark:bg-gray-800 rounded-lg">
      <h4 className="font-medium mb-2 dark:text-white">Recommendations</h4>
      <ul className="space-y-2 text-sm dark:text-gray-300">
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-tonstores-green rounded-full mt-1.5 mr-2" />
          <span>
            Consider setting up a loyalty program to increase your returning customer rate.
          </span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-tonstores-green rounded-full mt-1.5 mr-2" />
          <span>
            Your average items per order is {customerInsights?.averageItemsPerOrder.toFixed(1) || 0}. 
            Try bundling products to increase this metric.
          </span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-tonstores-green rounded-full mt-1.5 mr-2" />
          <span>
            Send targeted emails to your {customerInsights?.totalCustomers || 0} customers 
            with personalized recommendations.
          </span>
        </li>
      </ul>
    </div>
  );
} 