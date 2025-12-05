import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type SocialMediaStats = {
  source: string;
  count: number;
  revenue: number;
}

type SocialMediaInsightsProps = {
  socialMediaStats: SocialMediaStats[];
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
              {entry.name.includes('Revenue') ? `₦${entry.value.toLocaleString()}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SocialMediaInsights({ 
  socialMediaStats, 
  loading = false, 
  error, 
  onRetry 
}: SocialMediaInsightsProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Format social media source names nicely
  const formatSourceName = (source: string): string => {
    if (!source) return "Other/Direct";
    // Capitalize first letter
    return source.charAt(0).toUpperCase() + source.slice(1);
  };
  
  const formattedData = socialMediaStats.map(stat => ({
    ...stat,
    source: formatSourceName(stat.source)
  }));
  
  // Component to render chart content
  const ChartContent = () => (
    <>
      {socialMediaStats.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%" className="mt-4">
          <BarChart
            data={formattedData}
            layout="vertical"
            margin={{
              top: 10,
              right: isMobile && !isFullScreen ? 15 : 40,
              left: isMobile && !isFullScreen ? 10 : 30,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color, #e5e5e5)" />
            <XAxis 
              type="number" 
              tick={{ fontSize: isMobile && !isFullScreen ? 10 : 12, fill: 'var(--chart-text-color, currentColor)' }}
              stroke="var(--chart-axis-color, #888)"
            />
            <YAxis 
              type="category" 
              dataKey="source" 
              width={isFullScreen ? 120 : 100}
              tick={{ fontSize: isFullScreen ? 14 : 12, fill: 'var(--chart-text-color, currentColor)' }}
              stroke="var(--chart-axis-color, #888)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: isMobile && !isFullScreen ? 10 : 12, paddingTop: '10px' }} 
              iconSize={isMobile && !isFullScreen ? 8 : 10}
              verticalAlign="bottom"
              height={36}
            />
            <Bar 
              dataKey="count" 
              name="Orders" 
              fill="#075E54"
              radius={[0, 4, 4, 0]}
            />
            <Bar 
              dataKey="revenue" 
              name="Revenue (₦)" 
              fill="#25D366"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No social media data available yet.</p>
        </div>
      )}
    </>
  );
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Insights</CardTitle>
          <CardDescription>
            Track sales from different social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[350px] w-full">
            <LoadingState text="Loading social media data..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Insights</CardTitle>
          <CardDescription>
            Track sales from different social media platforms
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
            <h2 className="text-xl font-bold dark:text-white">Social Media Insights</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Track sales from different social media platforms</p>
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
          <CardTitle>Social Media Insights</CardTitle>
          <CardDescription>
            Track sales from different social media platforms
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