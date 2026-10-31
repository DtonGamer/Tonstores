import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface MessageTemplate {
  id: string;
  title: string;
  label?: string;   // small tag, e.g. "WhatsApp", "Status", "Email"
  subject?: string; // only shown for emails
  body: string;
}

interface MessageTemplateCardProps {
  heading?: string;
  description?: string;
  templates: MessageTemplate[];
}

const EmailTemplateCard = ({
  heading = "Ready-made messages",
  description = "Copy, add a name, and send.",
  templates,
}: MessageTemplateCardProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <div className="p-5 sm:p-6">
        <h3 className="text-lg font-extrabold mb-1">{heading}</h3>
        <p className="text-muted-foreground text-sm mb-5">{description}</p>

        <div className="space-y-4">
          {templates.map((t) => (
            <div key={t.id} className="p-4 rounded-xl border border-border bg-muted">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div>
                  <h4 className="font-semibold">{t.title}</h4>
                  {t.label && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-Tonstores-green/10 text-Tonstores-green font-semibold">
                      {t.label}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 flex-none"
                  onClick={() => handleCopy(t.subject ? `Subject: ${t.subject}\n\n${t.body}` : t.body, t.id)}
                >
                  {copiedId === t.id ? (
                    <><CheckCircle className="h-4 w-4 mr-1" /> Copied</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-1" /> Copy</>
                  )}
                </Button>
              </div>
              {t.subject && (
                <p className="text-sm bg-background p-2.5 rounded-lg border border-border mb-2">
                  <span className="font-semibold">Subject: </span>{t.subject}
                </p>
              )}
              <div className="text-sm bg-background p-3 rounded-lg border border-border whitespace-pre-line">{t.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateCard;
