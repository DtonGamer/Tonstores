import { Mail, MessageCircle, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EmailTemplate {
  id: string;
  title: string;
  subject: string;
  body: string;
  category: 'cold-outreach' | 'warm-intro' | 'success-story' | 'value-proposition';
}

interface EmailTemplateCardProps {
  templates: EmailTemplate[];
}

const EmailTemplateCard = ({ templates }: EmailTemplateCardProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (templateBody: string, id: string) => {
    navigator.clipboard.writeText(templateBody);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'cold-outreach':
        return 'Cold Outreach';
      case 'warm-intro':
        return 'Warm Introduction';
      case 'success-story':
        return 'Success Story';
      case 'value-proposition':
        return 'Value Proposition';
      default:
        return 'Template';
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Mail className="h-5 w-5 text-Tonstores-green mr-2" />
          <h3 className="text-lg font-semibold dark:text-white">Email Templates</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Ready-to-use templates for reaching out to fellow builders
        </p>

        <div className="space-y-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium dark:text-white">{template.title}</h4>
                  <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-Tonstores-green/10 text-Tonstores-green">
                    {getCategoryLabel(template.category)}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => handleCopy(template.body, template.id)}
                >
                  {copiedId === template.id ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border">
                  {template.subject}
                </p>
              </div>
              
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body:</p>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border whitespace-pre-line">
                  {template.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateCard;