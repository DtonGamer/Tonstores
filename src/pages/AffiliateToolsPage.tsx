import { Download, FileText, MessageCircle, Users, Star, Trophy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecognitionBadge from "@/components/affiliate/RecognitionBadge";
import AffiliateResourceCard from "@/components/affiliate/AffiliateResourceCard";
import CaseStudyComparisonCard from "@/components/affiliate/CaseStudyComparisonCard";
import EmailTemplateCard from "@/components/affiliate/EmailTemplateCard";
import ConversationGuideCard from "@/components/affiliate/ConversationGuideCard";

const AffiliateToolsPage = () => {
  // Sample resources data
  const resources = [
    {
      id: "1",
      title: "How to Explain Tonstores to Your Network",
      description: "A conversation guide with talking points to help you explain the value of Tonstores to fellow builders",
      type: "template" as const,
      category: "builder" as const
    },
    {
      id: "2",
      title: "Builder Success Case Studies",
      description: "Real stories of builders who transformed their businesses using Tonstores infrastructure",
      type: "case-study" as const,
      category: "success" as const
    },
    {
      id: "3",
      title: "Platform Comparison Guide",
      description: "How extraction platforms compare to the Tonstores infrastructure model",
      type: "comparison" as const,
      category: "comparison" as const
    },
    {
      id: "4",
      title: "Affiliate Email Templates",
      description: "Ready-to-use email templates for different occasions and audiences",
      type: "template" as const,
      category: "builder" as const
    }
  ];

  // Talking points for conversation guides
  const talkingPoints = [
    {
      id: "1",
      title: "The Infrastructure Advantage",
      content: "Tonstores gives you complete ownership of your customer data and sales infrastructure. Unlike other platforms that extract value and control your business, you own everything - your customer contacts, your catalog, your sales process.",
      category: "independence" as const
    },
    {
      id: "2",
      title: "Real-World Builder Benefits",
      content: "Built for real-world builders in challenging markets. If banks won't serve you or traditional e-commerce is too complex, Tonstores provides the simplest path to professional infrastructure that works like the big players but without platform dependency.",
      category: "value" as const
    },
    {
      id: "3",
      title: "The Parallel Infrastructure Concept",
      content: "Instead of relying on platforms that can change rules overnight, you're building parallel infrastructure that you control. This is about long-term business sustainability, not just making a few sales.",
      category: "community" as const
    },
    {
      id: "4",
      title: "Success Stories",
      content: "Fellow builders report 30-50% less time spent on admin tasks and 20-40% more sales efficiency. The system consolidates all your customer touchpoints into one professional infrastructure.",
      category: "success" as const
    }
  ];

  // Case studies and comparison resources
  const caseStudies = [
    {
      id: "cs-1",
      title: "Lagos Fashion Seller: 40% Sales Increase",
      description: "How a fashion seller in Lagos reduced admin time by 5 hours per week and increased sales by 40% using Tonstores infrastructure",
      type: "case-study" as const,
      category: "success" as const
    },
    {
      id: "cs-2",
      title: "Kano Artisan: Professional Growth",
      description: "How an artisan in Kano used Tonstores to professionalize their craft business and build a customer base beyond local reach",
      type: "case-study" as const,
      category: "success" as const
    },
    {
      id: "comp-1",
      title: "Platform Extraction vs Infrastructure Ownership",
      description: "Detailed comparison between extraction platforms and infrastructure ownership models for builders",
      type: "comparison" as const,
      category: "comparison" as const
    },
    {
      id: "comp-2",
      title: "Why Traditional E-commerce Fails Builders",
      description: "Analysis of how traditional e-commerce platforms don't work for builders in challenging markets",
      type: "comparison" as const,
      category: "comparison" as const
    }
  ];

  // Email templates
  const emailTemplates = [
    {
      id: "et-1",
      title: "Warm Introduction",
      subject: "Quick tool for managing your catalog and orders",
      body: `Hi [Name],

I've been using this tool called Tonstores that's been helping me manage my business more efficiently. It's like having your own professional infrastructure for showcasing products, managing orders, and connecting with customers - but it's built for builders like us who need something reliable and independent from platforms that change rules.

I thought it might be helpful for your business too. If you're interested, I can share more details or answer any questions you might have.

Best,
[Your name]`,
      category: "warm-intro" as const
    },
    {
      id: "et-2",
      title: "Success Story Share",
      subject: "How I reduced admin time by 5 hours/week",
      body: `Hi [Name],

Just wanted to share something that's been a game-changer for my business operations. I've been using Tonstores to manage my catalog and orders, and it's cut my admin time by about 5 hours per week.

What I like most is that I fully own my customer data and sales process - no platform dependency. It's been especially helpful for consolidating orders from different channels.

If you're juggling multiple platforms or losing track of orders, this might be worth checking out.

Best,
[Your name]`,
      category: "success-story" as const
    },
    {
      id: "et-3",
      title: "Value Proposition",
      subject: "Professional infrastructure built for builders",
      body: `Hi [Name],

Tonstores is infrastructure built specifically for builders who've been excluded from traditional systems. It gives you:

- Professional catalog with shareable link
- Order management system
- Customer contact management
- Full ownership of your data
- Independence from platform rules

It's designed for real-world builders who need reliable tools, not platforms that extract value from your success.

Would love to hear your thoughts.

Best,
[Your name]`,
      category: "value-proposition" as const
    }
  ];

  // Sample recognition badges
  const badges = [
    {
      id: "founder",
      title: "Founding Infrastructure Partner",
      description: "Awarded to early affiliates who contribute to building the ecosystem",
      icon: <Star className="h-5 w-5 text-yellow-500" />,
      status: "inactive" as const
    },
    {
      id: "community-builder",
      title: "Community Builder",
      description: "Earned by affiliates with 10+ active referrals",
      icon: <Star className="h-5 w-5 text-blue-500" />,
      status: "inactive" as const
    },
    {
      id: "top-earner",
      title: "Top Earner",
      description: "Awarded to affiliates with highest monthly earnings",
      icon: <Star className="h-5 w-5 text-green-500" />,
      status: "inactive" as const
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Affiliate Tools & Resources</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resources to help you promote Tonstores effectively to fellow builders
        </p>
      </div>

      <div className="space-y-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CaseStudyComparisonCard
            resources={caseStudies}
            onResourceAccess={(id) => console.log(`Accessing resource: ${id}`)}
          />
          <ConversationGuideCard
            talkingPoints={talkingPoints}
            onCopy={(content) => navigator.clipboard.writeText(content)}
          />
        </div>

        <EmailTemplateCard templates={emailTemplates} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Resources Library</CardTitle>
            </CardHeader>
            <CardContent>
              <AffiliateResourceCard resources={resources.map(r => ({...r, icon: null}))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Marketing Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 text-Tonstores-green mr-2" />
                    <h3 className="font-medium dark:text-white">Landing Page Template</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    A customizable landing page to showcase the benefits of Tonstores to your network
                  </p>
                  <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center mb-3">
                    <MessageCircle className="h-5 w-5 text-Tonstores-green mr-2" />
                    <h3 className="font-medium dark:text-white">Social Media Pack</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Pre-written posts and graphics for Instagram, TikTok, and other platforms
                  </p>
                  <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center mb-3">
                    <Users className="h-5 w-5 text-Tonstores-green mr-2" />
                    <h3 className="font-medium dark:text-white">Comparison Chart</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Visual comparison of Tonstores vs. traditional platforms
                  </p>
                  <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 text-Tonstores-green mr-2" />
                    <h3 className="font-medium dark:text-white">FAQ Document</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Answers to common questions about Tonstores and the affiliate program
                  </p>
                  <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Affiliate Testimonials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-gray-700 dark:text-gray-300 italic mb-3">
                    "I joined the affiliate program because I truly believe in the Tonstores mission. 
                    When I help fellow builders get professional infrastructure, we all benefit - 
                    they get better tools, customers get better service, and I earn a commission. 
                    It's a win-win-win!"
                  </p>
                  <div className="flex items-center">
                    <div className="bg-Tonstores-green/10 rounded-full p-2 mr-3">
                      <Users className="h-4 w-4 text-Tonstores-green" />
                    </div>
                    <div>
                      <h4 className="font-medium dark:text-white">Chinedu O.</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lagos Fashion Seller</p>
                    </div>
                  </div>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-gray-700 dark:text-gray-300 italic mb-3">
                    "The affiliate program isn't just about commissions for me. 
                    It's about building a community of professional builders who don't have to ask 
                    permission from exploitative platforms to grow their businesses."
                  </p>
                  <div className="flex items-center">
                    <div className="bg-Tonstores-green/10 rounded-full p-2 mr-3">
                      <Users className="h-4 w-4 text-Tonstores-green" />
                    </div>
                    <div>
                      <h4 className="font-medium dark:text-white">Fatima B.</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Kano Artisan Crafts</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Recognition Program</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Top affiliates get recognized as infrastructure advocates in our community. 
                Earn badges that reflect your contribution to the ecosystem.
              </p>
              
              <div className="space-y-4">
                {badges.map((badge) => (
                  <RecognitionBadge 
                    key={badge.id}
                    title={badge.title}
                    description={badge.description}
                    icon={badge.icon}
                    status={badge.status}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Affiliate Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-3 mt-0.5">
                    <Star className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Focus on builders who are frustrated with platform fees</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-3 mt-0.5">
                    <Star className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Share your own success story first</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-3 mt-0.5">
                    <Star className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Emphasize data ownership and independence</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-3 mt-0.5">
                    <Star className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Use the comparison materials when appropriate</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-3 mt-0.5">
                    <Star className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Follow up with prospects after 2-3 weeks</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AffiliateToolsPage;