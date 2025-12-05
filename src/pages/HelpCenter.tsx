import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How do I create a catalog?",
    answer: "To create a catalog, log in to your account, click on 'New Catalog' in your dashboard, fill in the catalog details, and start adding products. You can customize your catalog's appearance and share it with customers."
  },
  {
    question: "How do I add products to my catalog?",
    answer: "After creating a catalog, click on the 'Products' tab, then click 'Add Product'. Fill in the product details including name, description, price, and image. Click 'Save' to add the product to your catalog."
  },
  {
    question: "How do I share my catalog with customers?",
    answer: "Each catalog has a unique shareable link. You can find this link by clicking the 'Share' button on your catalog. Share this link via WhatsApp, email, or social media to let customers view your catalog."
  },
  {
    question: "How do I process orders?",
    answer: "When customers place orders through your catalog, you'll receive notifications. Go to the 'Orders' section in your dashboard to view and manage orders. You can update order status and communicate with customers."
  },
  {
    question: "Can I customize my catalog's appearance?",
    answer: "Yes, you can customize your catalog's appearance including the layout, colors, and branding. These options are available in the catalog settings."
  },
  {
    question: "How do I manage inventory?",
    answer: "You can manage your product inventory by updating the 'In Stock' status for each product. This helps customers know which products are currently available."
  }
];

const categories = [
  {
    title: "Getting Started",
    icon: "🚀",
    description: "Learn the basics of using TonStores"
  },
  {
    title: "Account Management",
    icon: "👤",
    description: "Manage your account settings and security"
  },
  {
    title: "Catalog Management",
    icon: "📚",
    description: "Create and manage your catalogs"
  },
  {
    title: "Orders & Payments",
    icon: "💳",
    description: "Handle orders and process payments"
  },
  {
    title: "Sharing & Marketing",
    icon: "📱",
    description: "Share and promote your catalogs"
  },
  {
    title: "Technical Support",
    icon: "🔧",
    description: "Get help with technical issues"
  }
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-tonstores-darkblue text-center mb-8">
            How can we help you?
          </h1>
          
          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-12">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search for help..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
          
          {/* FAQs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="border rounded-lg"
                >
                  <button
                    className="w-full text-left px-4 py-3 flex justify-between items-center"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="text-gray-500" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-500" size={20} />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 py-3 border-t bg-gray-50">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact Support */}
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Still need help?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is available to assist you
            </p>
            <div className="space-x-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = "mailto:Creatorrichie@gmail.com"}
              >
                Email Support
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "https://wa.me/2349038650178"}
              >
                WhatsApp Support
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HelpCenter; 