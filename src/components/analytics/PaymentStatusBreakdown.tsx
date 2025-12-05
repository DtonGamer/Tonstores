import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesSummary } from "@/hooks/useAnalytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Format currency in Naira
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

type PaymentStatusBreakdownProps = {
  salesSummary: SalesSummary | null;
};

export function PaymentStatusBreakdown({ salesSummary }: PaymentStatusBreakdownProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  // Define colors for different payment statuses
  const STATUS_COLORS = {
    paid: "#4CAF50", // Green
    pending: "#FFC107", // Yellow/Amber
    failed: "#F44336", // Red
    cancelled: "#9E9E9E", // Grey
    refunded: "#2196F3", // Blue
  };

  if (!salesSummary) {
    return null;
  }

  // Prepare data for pie chart - order count by payment status
  const orderCountData = [
    { name: "Paid", value: salesSummary.paymentStatusBreakdown.paid, color: STATUS_COLORS.paid },
    { name: "Pending", value: salesSummary.paymentStatusBreakdown.pending, color: STATUS_COLORS.pending },
    { name: "Failed", value: salesSummary.paymentStatusBreakdown.failed, color: STATUS_COLORS.failed },
    { name: "Cancelled", value: salesSummary.paymentStatusBreakdown.cancelled, color: STATUS_COLORS.cancelled },
    { name: "Refunded", value: salesSummary.paymentStatusBreakdown.refunded, color: STATUS_COLORS.refunded }
  ].filter(item => item.value > 0); // Only include statuses with values

  // Prepare data for the revenue table
  const revenueData = [
    { name: "Paid", value: salesSummary.revenueByStatus.paid, color: STATUS_COLORS.paid },
    { name: "Pending", value: salesSummary.revenueByStatus.pending, color: STATUS_COLORS.pending },
    { name: "Refunded", value: salesSummary.revenueByStatus.refunded, color: STATUS_COLORS.refunded }
  ].filter(item => item.value > 0); // Only include statuses with values

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 shadow rounded text-sm">
          <p className="font-semibold">{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Payment Status</CardTitle>
        <CardDescription>
          Breakdown of orders by payment status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <h3 className="text-sm font-medium mb-4">Order Count by Status</h3>
            {orderCountData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderCountData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 40 : 50}
                      outerRadius={isMobile ? 70 : 85}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {orderCountData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom" 
                      align="center"
                      layout="horizontal"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No order data available
              </div>
            )}
          </div>

          {/* Revenue Table */}
          <div>
            <h3 className="text-sm font-medium mb-4">Revenue by Payment Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Status</th>
                    <th className="text-right py-2 px-4 font-medium">Amount</th>
                    <th className="text-right py-2 px-4 font-medium">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((item) => {
                    const percentage = salesSummary.totalSales > 0 
                      ? (item.value / salesSummary.totalSales) * 100 
                      : 0;
                      
                    return (
                      <tr key={item.name} className="border-b">
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            ></span>
                            {item.name}
                          </div>
                        </td>
                        <td className="text-right py-2 px-4 font-medium">
                          {formatCurrency(item.value)}
                        </td>
                        <td className="text-right py-2 px-4">
                          {percentage.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Total row */}
                  <tr className="border-b font-medium">
                    <td className="py-2 px-4">Total</td>
                    <td className="text-right py-2 px-4">
                      {formatCurrency(salesSummary.totalSales)}
                    </td>
                    <td className="text-right py-2 px-4">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Note about payment statuses */}
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Note:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50]"></span>
                  <span>Paid: Completed transactions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107]"></span>
                  <span>Pending: Orders awaiting payment</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2196F3]"></span>
                  <span>Refunded: Returned payments</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 