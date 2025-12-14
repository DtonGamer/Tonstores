import { FileText, Users, Target, TrendingUp, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'case-study' | 'comparison' | 'template' | 'tool';
  category: 'success' | 'comparison' | 'builder' | 'growth';
}

interface CaseStudyComparisonCardProps {
  resources: Resource[];
  onResourceAccess?: (resourceId: string) => void;
}

const CaseStudyComparisonCard = ({ resources, onResourceAccess }: CaseStudyComparisonCardProps) => {
  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'case-study':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'comparison':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'template':
        return <Target className="h-5 w-5 text-purple-500" />;
      default:
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'success':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'comparison':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'builder':
        return 'bg-purple-50 dark:bg-purple-900/20';
      case 'growth':
        return 'bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'success':
        return 'Success Story';
      case 'comparison':
        return 'Platform Comparison';
      case 'builder':
        return 'Builder Resource';
      case 'growth':
        return 'Growth Tool';
      default:
        return 'Resource';
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-Tonstores-green mr-2" />
          <h3 className="text-lg font-semibold dark:text-white">Case Studies & Comparisons</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Resources to help you explain Tonstores value to other builders
        </p>

        <div className="space-y-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className={`p-4 rounded-lg border dark:border-gray-700 ${getCategoryColor(resource.category)}`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium dark:text-white">{resource.title}</h4>
                      <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-Tonstores-green/10 text-Tonstores-green">
                        {getCategoryLabel(resource.category)}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => onResourceAccess?.(resource.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{resource.description}</p>
                  
                  <div className="mt-3 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseStudyComparisonCard;