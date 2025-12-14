import { ExternalLink, FileText, Download, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'template' | 'case-study' | 'comparison' | 'tool';
  icon: React.ReactNode;
}

interface AffiliateResourceCardProps {
  resources: Resource[];
}

const AffiliateResourceCard = ({ resources }: AffiliateResourceCardProps) => {
  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'template':
        return <MessageCircle className="h-5 w-5 text-Tonstores-green" />;
      case 'case-study':
        return <FileText className="h-5 w-5 text-Tonstores-green" />;
      case 'comparison':
        return <Users className="h-5 w-5 text-Tonstores-green" />;
      default:
        return <Download className="h-5 w-5 text-Tonstores-green" />;
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold dark:text-white mb-4">Affiliate Resources</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Tools and materials to help you promote Tonstores effectively
        </p>
        
        <div className="space-y-4">
          {resources.map((resource) => (
            <div 
              key={resource.id} 
              className="flex items-start justify-between p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <h4 className="font-medium dark:text-white">{resource.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{resource.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AffiliateResourceCard;