import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesOverTime } from "@/hooks/useAnalytics";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

type SalesChartProps = {
  salesOverTime: SalesOverTime[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
};

// Custom tooltip to make it more mobile-friendly
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded-md text-xs sm:text-sm">
        <p className="font-medium mb-1 dark:text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 mr-1 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="mr-2 dark:text-gray-300">{entry.name}:</span>
            <span className="font-semibold dark:text-white">
              {entry.name.includes('Sales') ? `₦${entry.value.toLocaleString()}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesChart({ salesOverTime, loading = false, error, onRetry }: SalesChartProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Pre-process data to ensure numeric values and handle edge cases
  const processedData = salesOverTime.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-NG', { 
      month: 'short', 
      day: 'numeric' 
    }),
    sales: Number(item.sales) || 0,
    orders: Number(item.orders) || 0
  }));

  // Debug: Log the processed data
  console.log('Processed data:', processedData);

  // Calculate Y-axis domains for better visibility
  const salesValues = processedData.map(d => d.sales);
  const ordersValues = processedData.map(d => d.orders);
  
  const salesMax = Math.max(...salesValues, 1);
  const ordersMax = Math.max(...ordersValues, 1);

  // Add some padding to the domains
  const salesDomain = [0, salesMax * 1.1];
  const ordersDomain = [0, ordersMax * 1.1];

  // Component to render chart content
  const ChartContent = () => (
    <>
      {processedData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%" className="mt-4">
          <LineChart
            data={processedData}
            margin={{
              top: 20,
              right: isMobile && !isFullScreen ? 20 : 40,
              left: isMobile && !isFullScreen ? 20 : 40,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: isMobile && !isFullScreen ? 10 : 12 }}
              tickMargin={8}
              interval="preserveStartEnd"
              stroke="#888"
              height={50}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(value) => `₦${value.toLocaleString()}`}
              tick={{ fontSize: isMobile && !isFullScreen ? 10 : 12 }}
              width={isMobile && !isFullScreen ? 60 : 80}
              stroke="#888"
              domain={salesDomain}
              padding={{ top: 10 }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#888"
              domain={ordersDomain}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: isMobile && !isFullScreen ? 10 : 12, paddingTop: '10px' }} 
              iconSize={isMobile && !isFullScreen ? 8 : 10}
              verticalAlign="bottom"
              height={36}
            />
            <Line
              yAxisId="left"
              type="linear"
              dataKey="sales"
              name="Sales (₦)"
              stroke="#059669"
              strokeWidth={3}
              activeDot={{ r: 6, strokeWidth: 2 }}
              dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#059669" }}
              isAnimationActive={true}
              connectNulls={true}
            />
            <Line 
              yAxisId="right"
              type="linear" 
              dataKey="orders" 
              name="Orders" 
              stroke="#2563EB" 
              strokeWidth={3}
              activeDot={{ r: 6, strokeWidth: 2 }}
              dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#2563EB" }}
              isAnimationActive={true}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No sales data available yet.</p>
        </div>
      )}
    </>
  );
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            Your sales performance over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[350px] w-full">
            <LoadingState text="Loading sales data..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            Your sales performance over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[350px] w-full">
            <ErrorMessage message={error} onRetry={onRetry} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render the full-screen modal when in full-screen mode
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Sales Overview</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your sales performance over time</p>
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
        <div className="flex-grow p-6">
          <div className="h-[calc(100%-40px)] w-full">
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
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            Your sales performance over time.
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleFullScreen}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <Maximize2 size={16} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px] w-full">
          <ChartContent />
        </div>
      </CardContent>
    </Card>
  );
}