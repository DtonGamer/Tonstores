import { Calendar, ShoppingBag, CreditCard } from "lucide-react";

interface AffiliateReferralCardProps {
  id: string;
  referrerName: string;
  businessName: string;
  joinDate: string;
  status: 'active' | 'pending' | 'inactive';
  totalSpent: number;
  commissionEarned: number;
  commissionRate: number;
}

const AffiliateReferralCard = ({
  id,
  referrerName,
  businessName,
  joinDate,
  status,
  totalSpent,
  commissionEarned,
  commissionRate
}: AffiliateReferralCardProps) => {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    inactive: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h3 className="text-lg font-medium dark:text-white">{businessName}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Referred by {referrerName}</p>
            
            <div className="flex flex-wrap items-center gap-2 sm:space-x-3 mt-3">
              <span className={`text-xs px-2 py-1 rounded ${statusColors[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Joined: {new Date(joinDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center text-sm">
            <CreditCard className="h-4 w-4 text-Tonstores-green mr-2" />
            <div>
              <p className="font-medium dark:text-white">₦{totalSpent.toLocaleString()}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Total Spent</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <ShoppingBag className="h-4 w-4 text-Tonstores-green mr-2" />
            <div>
              <p className="font-medium dark:text-white">₦{commissionEarned.toLocaleString()}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Commission Earned</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-Tonstores-green mr-2" />
            <div>
              <p className="font-medium dark:text-white">{commissionRate}%</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Commission Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateReferralCard;