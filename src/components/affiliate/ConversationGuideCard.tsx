import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TalkingPoint {
  id: string;
  title: string;   // the question a seller might ask
  content: string; // the answer to say or send
}

interface ConversationGuideCardProps {
  talkingPoints: TalkingPoint[];
  onCopy?: (content: string) => void;
}

const ConversationGuideCard = ({ talkingPoints, onCopy }: ConversationGuideCardProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (point: TalkingPoint) => {
    navigator.clipboard.writeText(point.content);
    onCopy?.(point.content);
    setCopiedId(point.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <div className="p-5 sm:p-6">
        <h3 className="text-lg font-extrabold mb-1">What to say</h3>
        <p className="text-muted-foreground text-sm mb-5">Short answers to the questions sellers usually ask.</p>
        <div className="space-y-3">
          {talkingPoints.map((point) => (
            <div key={point.id} className="p-4 rounded-xl border border-border bg-muted">
              <h4 className="font-semibold mb-1">{point.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{point.content}</p>
              <Button variant="outline" size="sm" onClick={() => handleCopy(point)}>
                {copiedId === point.id ? (
                  <><CheckCircle className="h-4 w-4 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-4 w-4 mr-1" /> Copy answer</>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationGuideCard;
