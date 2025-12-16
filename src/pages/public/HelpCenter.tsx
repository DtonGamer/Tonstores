
import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I start building my infrastructure?",
        answer: "Sign up free (no credit card needed), click 'New Catalog' in your dashboard, add your business details, and start adding products. Your infrastructure is live in 5 minutes. You own everything from day one."
      },
      {
        question: "What does 'own your data' actually mean?",
        answer: "Your customer contacts, order history, and catalog belong to you—not us, not a platform. Export everything anytime. If you leave Tonstores, you take your entire business with you. No lock-in, ever."
      },
      {
        question: "How is this different from just using Instagram?",
        answer: "Instagram can change algorithms, restrict your reach, or change rules overnight. With Tonstores, YOU control your infrastructure. If Instagram dies tomorrow, you still have your customers, catalog, and sales system. Route them through WhatsApp or anywhere else."
      }
    ]
  },
  {
    category: "Managing Your Business",
    questions: [
      {
        question: "How do I add products to my catalog?",
        answer: "In your dashboard, go to your catalog and click 'Add Product.' Upload photos, write descriptions, set prices. Update once here, and it's live everywhere you share your link. No more copying between platforms."
      },
      {
        question: "Can I manage orders without spreadsheet chaos?",
        answer: "Yes. All orders come to your dashboard. See what was ordered, by whom, payment status, delivery details—all in one place. No more lost WhatsApp messages or forgotten Instagram DMs."
      },
      {
        question: "What if I need to track which platform sells best?",
        answer: "Pro and Business tiers show you which products sell on which platforms. See if your Instagram customers buy different items than WhatsApp customers. Make strategic decisions based on data you control."
      }
    ]
  },
  {
    category: "Control & Independence",
    questions: [
      {
        question: "What happens if Instagram changes something?",
        answer: "You route customers through WhatsApp or TikTok instead. Your infrastructure (catalog, customers, orders) stays with you. Platform changes don't destroy your business because you're not dependent on any single one."
      },
      {
        question: "Can I export my data if I want to leave?",
        answer: "Absolutely. Export everything—customer contacts, product catalog, order history—anytime. We don't hold your business hostage. You're free to leave whenever. We earn your business by serving you, not trapping you."
      },
      {
        question: "Do you take a cut of my sales like marketplaces do?",
        answer: "No. You pay a flat monthly fee (or use Free tier), and we don't touch your sales. You keep 100% of what you earn. We don't profit from your dependency—we profit from serving you well enough that you choose to stay."
      }
    ]
  },
  {
    category: "Sharing & Growing",
    questions: [
      {
        question: "How do I share my catalog?",
        answer: "Click 'Share' on your catalog to get your unique link. Send it anywhere—WhatsApp status, Instagram bio, TikTok profile, SMS, email. One link works everywhere. Update products once, change reflects everywhere instantly."
      },
      {
        question: "What if customers don't trust buying through a link?",
        answer: "That's what professional presentation solves. Your Tonstores catalog looks organized and trustworthy—not like scattered Instagram posts or WhatsApp status updates. Customers feel safe completing bank transfers when things look professional."
      },
      {
        question: "How do I scale from 10 products to 100 without chaos?",
        answer: "Upgrade to Pro tier when you outgrow Free (10 products). Pro handles up to 100 products with better organization and analytics. When you hit that, upgrade to Business for unlimited products. Your workflow stays the same—just bigger scale."
      }
    ]
  },
  {
    category: "Payments & Money",
    questions: [
      {
        question: "How do I get paid?",
        answer: "Customers complete orders through your catalog, then pay via bank transfer to your account (you provide account details). We integrated Paystack for smooth payment processing, but YOU receive the money directly—not us, not a platform."
      },
      {
        question: "Do I need a merchant account from a bank?",
        answer: "No. That's the point—banks excluded most Builders from merchant accounts. We built this so you can operate professionally WITHOUT needing bank approval. Accept payments directly to your regular account."
      },
      {
        question: "What are the actual costs?",
        answer: "Free tier: ₦0 forever (10 products). Pro: ₦15,000/month (100 products). Business: ₦33,000/month (unlimited). No hidden fees, no transaction cuts, no surprise charges. What you see is what you pay."
      }
    ]
  }
];

const categories = [
  {
    title: "Getting Started",
    icon: "🚀",
    description: "Build your first infrastructure in 5 minutes"
  },
  {
    title: "Ownership & Control",
    icon: "🔐",
    description: "Understanding what you own and control"
  },
  {
    title: "Managing Products",
    icon: "📦",
    description: "Add, organize, and update your catalog"
  },
  {
    title: "Orders & Payments",
    icon: "💰",
    description: "Get paid without platform intermediaries"
  },
  {
    title: "Sharing & Growth",
    icon: "📱",
    description: "Scale across platforms without dependency"
  },
  {
    title: "Independence",
    icon: "💪",
    description: "Maintain control as you grow"
  }
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const allQuestions = faqs.flatMap(cat => 
    cat.questions.map(q => ({
      ...q,
      category: cat.category,
      id: `${cat.category}-${q.question}`
    }))
  );

  const filteredQuestions = searchQuery
    ? allQuestions.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allQuestions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How Can We Help You <span className="text-Tonstores-green">Build</span>?
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Everything you need to own your infrastructure and grow without permission
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-12 -mt-8">
            <div className="bg-white rounded-xl shadow-lg p-2">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search for help..."
                className="pl-12 border-0 focus:ring-0 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-bold text-Tonstores-darkblue mb-2 group-hover:text-Tonstores-green transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-Tonstores-darkblue mb-6">
              {searchQuery ? "Search Results" : "Common Questions"}
            </h2>
            <div className="space-y-4">
              {filteredQuestions.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-Tonstores-green transition-colors"
                >
                  <button
                    className="w-full text-left px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  >
                    <div>
                      <span className="text-xs font-medium text-Tonstores-green mb-1 block">
                        {faq.category}
                      </span>
                      <span className="font-medium text-gray-900">{faq.question}</span>
                    </div>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="text-Tonstores-green flex-shrink-0 ml-4" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-400 flex-shrink-0 ml-4" size={20} />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-6 py-4 border-t bg-gray-50">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Still Need Help */}
          <div className="mt-12 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              We're Builders helping Builders. Real support, not corporate scripts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-white text-Tonstores-darkblue hover:bg-Tonstores-green hover:text-white"
                onClick={() => window.location.href = "mailto:Creatorrichie@gmail.com"}
              >
                Email Support
              </Button>
              <Button
                variant="outline"
                className="bg-white text-Tonstores-darkblue hover:bg-Tonstores-green hover:text-white"
                onClick={() => window.location.href = "https://wa.me/2349038650178"}
              >
                WhatsApp Support
              </Button>
            </div>
            <p className="text-sm text-blue-100 mt-4">
              Response time: Within 24 hours • Priority support for Pro & Business tiers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;