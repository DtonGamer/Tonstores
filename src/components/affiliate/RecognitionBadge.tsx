import { BadgeCheck, Trophy, Star, Target } from "lucide-react";

interface RecognitionBadgeProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'pending';
}

const RecognitionBadge = ({ title, description, icon, status }: RecognitionBadgeProps) => {
  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };

  const statusIcons = {
    active: <BadgeCheck className="h-5 w-5 text-green-600" />,
    inactive: <Trophy className="h-5 w-5 text-gray-400" />,
    pending: <Star className="h-5 w-5 text-yellow-600" />
  };

  return (
    <div className={`border rounded-lg p-5 bg-white dark:bg-gray-800 ${statusColors[status]}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-medium dark:text-white">{title}</h3>
            <span className={`ml-2 text-xs px-2 py-1 rounded-full border ${statusColors[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default RecognitionBadge;