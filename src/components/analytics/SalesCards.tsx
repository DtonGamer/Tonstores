import { SalesSummary } from "@/hooks/useAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Users,
} from "lucide-react";

type SalesCardsProps = {
  salesSummary: SalesSummary | null;
};

// Format currency in Naira
const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined) return "₦0";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage with + or - sign
const formatPercentage = (value: number | undefined, plusSign = true) => {
  if (value === undefined) return "0%";
  return `${value > 0 && plusSign ? '+' : ''}${Math.round(value)}%`;
};

export function SalesCards({ salesSummary }: SalesCardsProps) {
  // If no data, show placeholder cards
  if (!salesSummary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-gray-50 dark:bg-gray-800/50">
            <CardContent className="p-6 flex items-center justify-center h-32">
              <div className="text-gray-400 dark:text-gray-500">No data available</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(salesSummary.totalSales),
      change: formatPercentage(salesSummary.percentChanges?.sales),
      icon: <DollarSign className="h-5 w-5" />,
      trend: salesSummary.percentChanges?.sales,
      color: "bg-green-500",
      metric: "From last month",
    },
    {
      title: "Orders",
      value: salesSummary.totalOrders,
      change: formatPercentage(salesSummary.percentChanges?.orders),
      icon: <ShoppingBag className="h-5 w-5" />,
      trend: salesSummary.percentChanges?.orders,
      color: "bg-blue-500",
      metric: "From last month",
    },
    {
      title: "Avg. Order Value",
      value: formatCurrency(salesSummary.averageOrderValue),
      change: formatPercentage(salesSummary.percentChanges?.averageOrder),
      icon: <CreditCard className="h-5 w-5" />,
      trend: salesSummary.percentChanges?.averageOrder,
      color: "bg-purple-500",
      metric: "From last month",
    },
    {
      title: "Payment Success Rate",
      value: `${Math.round((salesSummary.paymentStatusBreakdown.paid / (salesSummary.totalOrders || 1)) * 100)}%`,
      change: "",
      icon: <TrendingUp className="h-5 w-5" />,
      trend: 0,
      color: "bg-amber-500",
      metric: "Of total orders",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className="overflow-hidden hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700"
        >
          <CardContent className="p-0">
            <div className="flex flex-col h-full">
              {/* Color bar at top */}
              <div className={`h-1 w-full ${card.color}`}></div>
              
              <div className="p-5 flex flex-col h-full">
                {/* Card title and icon */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</div>
                  <div className={`${card.color} bg-opacity-15 dark:bg-opacity-20 p-1.5 rounded-md`}>
                    {card.icon}
                  </div>
                </div>
                
                {/* Value */}
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </div>
                
                {/* Change indicator */}
                <div className="mt-1 flex items-center gap-1.5">
                  {card.trend > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : card.trend < 0 ? (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  ) : null}
                  
                  <div className={`text-sm ${
                    card.trend > 0 
                      ? 'text-green-600 dark:text-green-500' 
                      : card.trend < 0 
                        ? 'text-red-600 dark:text-red-500' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="font-medium">{card.change}</span> <span className="text-gray-500 dark:text-gray-400 text-xs">{card.metric}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 