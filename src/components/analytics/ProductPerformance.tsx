import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopProduct } from "@/hooks/useAnalytics"; 
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { LoadingState } from "@/components/ui/loading-state";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Maximize2, Minimize2, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Format currency in Naira
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

type ProductPerformanceProps = {
  topProducts: TopProduct[];
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: string;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
        <p className="font-medium mb-2 text-sm">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 mr-2 rounded-full" 
              style={{ backgroundColor: entry.fill }}
            />
            <span className="mr-1">{entry.name}:</span>
            <span className="font-semibold">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ProductPerformance({ topProducts }: ProductPerformanceProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // First filter out products with zero sales
  const productsWithSales = topProducts.filter(product => product.sales > 0);
  
  // Then sort by sales
  const sortedProducts = [...productsWithSales].sort((a, b) => b.sales - a.sales);
  
  // Take top 5 for chart
  const chartProducts = sortedProducts.slice(0, 5).map(product => ({
    ...product,
    // Truncate long names
    name: product.name.length > 18 ? `${product.name.substring(0, 15)}...` : product.name,
  }));

  // Component to render chart content  
  const ChartContent = () =>
    <>
      {chartProducts.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%" className="mt-4">
          <BarChart
            data={chartProducts}
            layout="vertical"
            margin={{
              top: 20,
              right: isMobile ? 20 : 40,
              left: isMobile ? 20 : 40,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color, #e5e5e5)" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => `₦${value.toLocaleString()}`} 
              tick={{ fill: 'var(--chart-text-color, currentColor)', fontSize: 12 }}
              stroke="var(--chart-axis-color, #888)"
              domain={[0, 'dataMax']}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={isFullScreen ? 150 : 100}
              tick={{ fontSize: isFullScreen ? 14 : 12, fill: 'var(--chart-text-color, currentColor)' }}
              stroke="var(--chart-axis-color, #888)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Bar 
              dataKey="sales" 
              name="Revenue" 
              fill="#4C51BF"
              radius={[0, 4, 4, 0]}
            >
              {chartProducts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${240 - index * 15}, 65%, 60%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No product sales data available yet.</p>
          </div>
        </div>
      )}
    </>;

  // List view of top products
  const ProductList = () => (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">Top Selling Products</h3>
        <Badge variant="outline" className="font-normal">By Revenue</Badge>
      </div>
      {topProducts.length > 0 ? (
        <ScrollArea className="h-[180px] pr-4">
          {sortedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-200">{product.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{product.orders} units sold</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right font-medium">{formatCurrency(product.sales)}</div>
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              </div>
            </div>
          ))}
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center h-32 border border-dashed rounded-md border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No products data available</p>
        </div>
      )}
    </div>
  );

  // Render the full-screen modal when in full-screen mode
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Product Performance</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Top selling products by revenue</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleFullScreen}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto">
          <div className="h-[600px] lg:h-full relative">
            <div className="absolute inset-0">
              <ChartContent />
            </div>
          </div>
          <div className="h-auto">
            <ProductList />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-base sm:text-lg">Product Performance</CardTitle>
          <CardDescription>
            Top selling products by revenue
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleFullScreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ChartContent />
        </div>
        <ProductList />
      </CardContent>
    </Card>
  );
} 