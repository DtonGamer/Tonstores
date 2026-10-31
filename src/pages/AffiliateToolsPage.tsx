import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmailTemplateCard from "@/components/affiliate/EmailTemplateCard";
import ConversationGuideCard from "@/components/affiliate/ConversationGuideCard";

const chatMessages = [
  {
    id: "wa-1",
    title: "Message a seller you know",
    label: "WhatsApp",
    body: "Hey! I stopped retyping my prices every week. I put all my products in one link and customers order from it. It's free to start, you can try it here: [your link]",
  },
  {
    id: "wa-2",
    title: "For your status or Instagram story",
    label: "Status",
    body: "My whole shop in one link. I change a price once and it updates everywhere. Free to try: [your link]",
  },
  {
    id: "wa-3",
    title: "When they say Instagram is enough",
    label: "Reply",
    body: "Instagram's reach keeps changing. A catalog link works on WhatsApp, Instagram and TikTok, and your customers stay yours. You can try it free: [your link]",
  },
];

const emails = [
  {
    id: "em-1",
    title: "Introduce Tonstores",
    label: "Email",
    subject: "One link for all your products",
    body: `Hi [Name],

I've been using Tonstores to share my products. I add them once, send one link, and customers order from it. I no longer retype prices on WhatsApp.

It's free to start, so you can try it without risk:
[your link]

[Your name]`,
  },
  {
    id: "em-2",
    title: "Follow up",
    label: "Email",
    subject: "Did you get a chance to try it?",
    body: `Hi [Name],

Just checking in. If you've been juggling WhatsApp, Instagram and TikTok to sell, Tonstores might save you some time. Setting up usually takes a few minutes.

[your link]

[Your name]`,
  },
];

const answers = [
  { id: "q1", title: "What is it?", content: "It's one link for all your products. Customers open it, pick what they want and order. You manage everything in one place." },
  { id: "q2", title: "Is it free?", content: "Yes, you can start free with up to 10 products. Paid plans are there if you need more." },
  { id: "q3", title: "How do I get paid?", content: "Customers pay at checkout through Paystack. The payment is held until they confirm delivery, then it's released to you." },
  { id: "q4", title: "Why not just use Instagram?", content: "Instagram can change how many people see your posts. Your Tonstores link and your customers stay yours, and you can share the link anywhere." },
];

const tips = [
  "Start with sellers who retype prices or reply to the same questions often",
  "Tell them what changed for you first",
  "Message one person at a time. Please don't spam groups",
  "Follow up once after a few days",
  "Be honest. Don't promise sales or results",
];

const AffiliateToolsPage = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold">Messages and tips</h1>
        <p className="text-muted-foreground">Copy a message, send it to a seller you know, and earn when they subscribe.</p>
      </div>
      <Link to="/affiliate"><Button variant="outline">Back to my link</Button></Link>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <EmailTemplateCard
          heading="WhatsApp and status messages"
          description="Replace [your link] with your invite link, then send."
          templates={chatMessages}
        />
        <ConversationGuideCard talkingPoints={answers} />
        <EmailTemplateCard
          heading="Email templates"
          description="For people who prefer email."
          templates={emails}
        />
      </div>

      <div className="space-y-6">
        <div className="border border-border rounded-2xl bg-card p-5 sm:p-6">
          <h3 className="text-lg font-extrabold mb-4">Tips</h3>
          <ul className="space-y-3">
            {tips.map((t) => (
              <li key={t} className="flex items-start text-sm">
                <span className="bg-Tonstores-green/10 rounded-full p-1 mr-3 mt-0.5 flex-none">
                  <Check className="h-3.5 w-3.5 text-Tonstores-green" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default AffiliateToolsPage;
