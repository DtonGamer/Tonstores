import { BadgeCheck } from "lucide-react";

interface RecognitionBadgeProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  status?: "active" | "inactive" | "pending";
}

const statusStyles = {
  active: "bg-Tonstores-green/10 text-Tonstores-green",
  pending: "bg-Tonstores-amber/20 text-amber-900",
  inactive: "bg-muted text-muted-foreground",
};

const RecognitionBadge = ({ title, description, icon, status }: RecognitionBadgeProps) => (
  <div className="border border-border rounded-2xl p-4 bg-card">
    <div className="flex items-start">
      <div className="mr-3 mt-0.5">{icon ?? <BadgeCheck className="h-5 w-5 text-Tonstores-green" />}</div>
      <div className="flex-1">
        <div className="flex items-center flex-wrap gap-2">
          <h3 className="font-semibold">{title}</h3>
          {status && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  </div>
);

export default RecognitionBadge;
