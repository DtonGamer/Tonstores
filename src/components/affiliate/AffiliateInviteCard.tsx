import { useState } from "react";
import { Copy, Share2, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AffiliateInviteCardProps {
  affiliateLink: string;
  onShare?: () => void;
}

const AffiliateInviteCard = ({ affiliateLink, onShare }: AffiliateInviteCardProps) => {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Extract the readable referral code from the link or show the UUID
  const referralCode = () => {
    try {
      const url = new URL(affiliateLink);
      return url.searchParams.get('ref') || '';
    } catch (e) {
      // If parsing fails, try to extract from the link as a fallback
      const regex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|ref=([^&]+)/i;
      const match = affiliateLink.match(regex);
      return match ? match[1] || match[0] : affiliateLink;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode());
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Tonstores",
        text: "Join Tonstores to build your infrastructure without asking permission from anyone.",
        url: affiliateLink
      });
    } else if (onShare) {
      onShare();
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-gradient-to-br from-Tonstores-lightgreen to-Tonstores-green dark:from-Tonstores-green/80 dark:to-Tonstores-darkgreen">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-Tonstores-darkblue dark:text-white mb-2">Share Your Affiliate Link</h3>
            <p className="text-Tonstores-darkblue/80 dark:text-white/80 text-sm mb-4">
              Invite fellow builders to join Tonstores and earn 20% recurring commission
            </p>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={affiliateLink}
                    readOnly
                    className="pr-24 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <Button
                  className="bg-Tonstores-darkblue hover:bg-Tonstores-darkblue/80 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={referralCode()}
                    readOnly
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={handleCopyCode}
                    >
                      {codeCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
                  Referral Code
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-Tonstores-darkgreen/20 dark:border-gray-700">
          <h4 className="font-medium text-Tonstores-darkblue dark:text-white mb-3">Why Builders Join Tonstores:</h4>
          <ul className="space-y-2 text-sm text-Tonstores-darkblue/90 dark:text-white/90">
            <li className="flex items-start">
              <div className="bg-white/20 rounded-full p-1 mr-2 mt-0.5">
                <LinkIcon className="h-3 w-3 text-Tonstores-darkblue dark:text-white" />
              </div>
              <span>Own your customer data and infrastructure</span>
            </li>
            <li className="flex items-start">
              <div className="bg-white/20 rounded-full p-1 mr-2 mt-0.5">
                <LinkIcon className="h-3 w-3 text-Tonstores-darkblue dark:text-white" />
              </div>
              <span>Build without depending on exploitative platforms</span>
            </li>
            <li className="flex items-start">
              <div className="bg-white/20 rounded-full p-1 mr-2 mt-0.5">
                <LinkIcon className="h-3 w-3 text-Tonstores-darkblue dark:text-white" />
              </div>
              <span>Professional tools for your business growth</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AffiliateInviteCard;