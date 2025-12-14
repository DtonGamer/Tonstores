import { Users, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

interface AffiliateStatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: string;
}

const AffiliateStatsCard = ({ title, value, change, icon, color }: AffiliateStatsCardProps) => {
  return (
    <div className="border dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold dark:text-white mt-1">{value}</h3>
          <p className={`text-sm mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AffiliateStatsCard;