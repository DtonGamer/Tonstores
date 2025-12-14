import { Link } from "react-router-dom";
import { ExternalLink, Users, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AffiliateCardProps {
  id: string;
  name: string;
  businessName: string;
  joinDate: string;
  status: 'active' | 'pending' | 'inactive';
  totalReferrals: number;
  totalEarnings: number;
  commissionRate: number;
  isAffiliate?: boolean;
  onApply?: () => void;
}

const AffiliateCard = ({
  id,
  name,
  businessName,
  joinDate,
  status,
  totalReferrals,
  totalEarnings,
  commissionRate,
  isAffiliate = false,
  onApply
}: AffiliateCardProps) => {
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
            <h3 className="text-lg font-medium dark:text-white">
              {businessName || name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{name}</p>
            
            <div className="flex flex-wrap items-center gap-2 sm:space-x-3 mt-3">
              <span className={`text-xs px-2 py-1 rounded ${statusColors[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Joined: {new Date(joinDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex space-x-2 self-start">
            {isAffiliate ? (
              <Link to={`/affiliate/referrals/${id}`}>
                <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                  View Details
                </Button>
              </Link>
            ) : (
              <Button 
                size="sm" 
                className="bg-Tonstores-green hover:bg-Tonstores-darkblue text-white"
                onClick={onApply}
              >
                Become Affiliate
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 text-Tonstores-green mr-2" />
            <div>
              <p className="font-medium dark:text-white">{totalReferrals}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Referrals</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-Tonstores-green mr-2" />
            <div>
              <p className="font-medium dark:text-white">₦{totalEarnings.toLocaleString()}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Earnings</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <Award className="h-4 w-4 text-Tonstores-green mr-2" />
            <div>
              <p className="font-medium dark:text-white">{commissionRate}%</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Commission</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <ExternalLink className="h-4 w-4 text-Tonstores-green mr-2" />
            <div>
              <p className="font-medium dark:text-white">{status.charAt(0)}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateCard;