import { MessageCircle, Lightbulb, Users, Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TalkingPoint {
  id: string;
  title: string;
  content: string;
  category: 'value' | 'comparison' | 'independence' | 'community' | 'success';
}

interface ConversationGuideCardProps {
  talkingPoints: TalkingPoint[];
  onCopy?: (content: string) => void;
}

const ConversationGuideCard = ({ talkingPoints, onCopy }: ConversationGuideCardProps) => {
  const categoryIcons = {
    value: <Lightbulb className="h-5 w-5 text-blue-500" />,
    comparison: <Users className="h-5 w-5 text-green-500" />,
    independence: <Building2 className="h-5 w-5 text-purple-500" />,
    community: <MessageCircle className="h-5 w-5 text-orange-500" />,
    success: <Zap className="h-5 w-5 text-yellow-500" />
  };

  const categoryColors = {
    value: 'bg-blue-50 dark:bg-blue-900/20',
    comparison: 'bg-green-50 dark:bg-green-900/20',
    independence: 'bg-purple-50 dark:bg-purple-900/20',
    community: 'bg-orange-50 dark:bg-orange-900/20',
    success: 'bg-yellow-50 dark:bg-yellow-900/20'
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    if (onCopy) {
      onCopy(content);
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <MessageCircle className="h-5 w-5 text-Tonstores-green mr-2" />
          <h3 className="text-lg font-semibold dark:text-white">Conversation Guides</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Talking points for explaining Tonstores to other builders
        </p>

        <div className="space-y-4">
          {talkingPoints.map((point) => (
            <div
              key={point.id}
              className={`p-4 rounded-lg border dark:border-gray-700 ${categoryColors[point.category]}`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {categoryIcons[point.category]}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium dark:text-white mb-2">{point.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{point.content}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => handleCopy(point.content)}
                  >
                    Copy Talking Point
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationGuideCard;