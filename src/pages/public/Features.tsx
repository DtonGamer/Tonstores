import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Zap, 
  Users,
  Database,
  TrendingUp,
  Lock,
  BarChart4,
  Target,
  Check,
  ArrowRight
} from "lucide-react";

// Icon components remain the same...
const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4.02a7.94 7.94 0 0 0-7.04 11.62L4 20.98l5.4-.96a7.93 7.93 0 0 0 3.8.97h.04A7.94 7.94 0 0 0 17.6 6.32zm-5.57 12.17h-.03a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.59 6.59 0 0 1-1.01-3.49 6.59 6.59 0 0 1 6.59-6.59 6.56 6.56 0 0 1 4.66 1.93 6.52 6.52 0 0 1 1.93 4.67 6.6 6.6 0 0 1-6.55 6.57zm3.61-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.78-.11.13-.23.15-.43.05a5.47 5.47 0 0 1-1.6-.99 6 6 0 0 1-1.11-1.38c-.12-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.14.03-.26-.02-.36-.05-.1-.45-1.08-.62-1.47-.16-.39-.33-.33-.45-.34-.12-.01-.25-.01-.38-.01-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63 0 .96.7 1.9.8 2.03.1.14 1.37 2.1 3.32 2.94.46.2.83.32 1.11.41.47.15.89.13 1.23.08.37-.06 1.15-.47 1.31-.93.16-.46.16-.85.11-.93-.05-.08-.19-.13-.4-.23z" fill="currentColor" />
  </svg>
);

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M19.321 5.562a5.124 5.124 0 0 1-1.38 1.015 5.086 5.086 0 0 1-1.616.518V9.39a5.052 5.052 0 0 1-2.299-.56v3.947a5.16 5.16 0 0 1-1.378 3.53 5.2 5.2 0 0 1-7.313.01 5.161 5.161 0 0 1 0-7.313 5.2 5.2 0 0 1 7.313.01c.011.01.02.022.03.032V5.332A9.885 9.885 0 0 0 10.95 4.4a9.9 9.9 0 0 0-5.213 1.495 9.938 9.938 0 0 0-3.595 4.144A9.892 9.892 0 0 0 1.2 14.91a9.958 9.958 0 0 0 2.892 7.024 9.958 9.958 0 0 0 6.817 2.866h.082a9.958 9.958 0 0 0 7.024-2.866 9.958 9.958 0 0 0 2.866-7.024V8.593a9.885 9.885 0 0 0 4.92 1.3V5.783a5.07 5.07 0 0 1-2.766-.768 5.16 5.16 0 0 1-1.815-1.816 5.07 5.07 0 0 1-.769-2.766h-3.109c.002 1.088.287 2.156.829 3.13z" fill="currentColor" />
  </svg>
);

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M6.77 3.082a47.472 47.472 0 0 1 10.46 0c1.806.204 3.27 1.655 3.458 3.472a45.61 45.61 0 0 1 0 10.892c-.188 1.817-1.652 3.268-3.458 3.472a47.468 47.468 0 0 1-10.46 0c-1.806-.204-3.27-1.655-3.458-3.472a45.614 45.614 0 0 1 0-10.892C3.5 4.737 4.964 3.286 6.77 3.082zM17 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-9.75 6a4.75 4.75 0 1 1 9.5 0 4.75 4.75 0 0 1-9.5 0z" fill="currentColor" />
  </svg>
);

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-all border border-gray-100 group">
      <div className="w-16 h-16 bg-gradient-to-br from-Tonstores-green/20 to-Tonstores-darkblue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="text-Tonstores-green" size={28} />
      </div>
      <h3 className="text-xl font-bold mb-3 text-Tonstores-darkblue">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      title: "Own Your Data",
      description: "Your customer database, sales history, and catalog belong to you. Export anytime, no lock-in.",
      icon: Database
    },
    {
      title: "Platform Independence",
      description: "If Instagram changes tomorrow, you're not destroyed. Route customers through any channel.",
      icon: Shield
    },
    {
      title: "Professional Trust",
      description: "Clean catalogs that make customers trust you with bank transfers and become repeat buyers.",
      icon: Lock
    },
    {
      title: "Control Your Infrastructure",
      description: "Update once, share everywhere. You control the source, not platforms.",
      icon: Zap
    },
    {
      title: "Track What Matters",
      description: "See which products sell, which platforms convert, where your growth is coming from.",
      icon: BarChart4
    },
    {
      title: "Builder Community",
      description: "Support from people who understand building without permission, not corporate scripts.",
      icon: Users
    },
    {
      title: "Scale on Your Terms",
      description: "Grow from 10 products to 1000 without changing your workflow or platform dependencies.",
      icon: TrendingUp
    },
    {
      title: "Focus on Selling",
      description: "Stop wasting 5 hours weekly on manual updates. Spend that time serving customers.",
      icon: Target
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Build Your Catalog",
      description: "Add your products once. Photos, descriptions, prices—organized in one place, under your control."
    },
    {
      step: 2,
      title: "Share Everywhere",
      description: "One link works on WhatsApp, Instagram, TikTok, anywhere. No platform dependency."
    },
    {
      step: 3,
      title: "Keep Your Customers",
      description: "Orders come to you directly. Customer data stays with you. No platform intermediary."
    },
    {
      step: 4,
      title: "Get Paid, Own Growth",
      description: "Payments flow to your account. You control pricing, timing, everything."
    }
  ];

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green z-0"></div>
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-white">
              <div className="inline-block mb-4">
                <span className="bg-Tonstores-green/20 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full border border-Tonstores-green/30">
                  Infrastructure for Independence
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Features Built for <span className="text-Tonstores-green">Builders Who Own Their Future</span>
              </h1>
              <div className="w-24 h-1.5 bg-Tonstores-green my-6 rounded-full"></div>
              <p className="mt-6 text-xl text-blue-100 max-w-2xl">
                Not just catalog software. The infrastructure you need to compete without asking permission from platforms or banks.
              </p>
              
              <div className="mt-8">
                <Link to="/register">
                  <Button className="px-8 py-6 bg-Tonstores-green hover:bg-white hover:text-Tonstores-darkblue text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
                    Start Building Free
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                    <Shield size={32} className="text-Tonstores-green mb-2" />
                    <h3 className="text-lg font-medium">You Own It</h3>
                    <p className="text-sm text-blue-100">Your data, your control</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                    <Database size={32} className="text-blue-400 mb-2" />
                    <h3 className="text-lg font-medium">Export Anytime</h3>
                    <p className="text-sm text-blue-100">No platform lock-in</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                    <TrendingUp size={32} className="text-purple-400 mb-2" />
                    <h3 className="text-lg font-medium">Scale Freely</h3>
                    <p className="text-sm text-blue-100">10 to 1000 products</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                    <Users size={32} className="text-pink-400 mb-2" />
                    <h3 className="text-lg font-medium">Builder Support</h3>
                    <p className="text-sm text-blue-100">Real help, not scripts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Value Props */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="bg-Tonstores-green/10 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
              WHAT YOU ACTUALLY GET
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue">
              Control + Legitimacy = Independence
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              The two things excluded builders need most
            </p>
            <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
              SIMPLE BY DESIGN
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue">
              Four Steps to Infrastructure Independence
            </h2>
            <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {howItWorks.map((item) => (
                <div key={item.step} className="flex items-start bg-white rounded-2xl p-8 shadow-md border border-gray-100 relative">
                  <div className="w-12 h-12 rounded-full bg-Tonstores-green text-white flex items-center justify-center text-lg font-bold absolute -top-6 left-8 shadow-lg">
                    {item.step}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-Tonstores-darkblue mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Platform Support - Reframed */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="bg-purple-100 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
              YOUR LINK, ANY PLATFORM
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue">
              Share Everywhere Without Platform Dependency
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              When one platform changes, you route through another. Your infrastructure stays yours.
            </p>
            <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 p-8 rounded-2xl shadow-md text-center">
              <WhatsAppIcon size={48} className="mx-auto mb-6 text-[#25D366]" />
              <h3 className="text-2xl font-bold mb-4 text-Tonstores-darkblue">WhatsApp</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start text-gray-600">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>Send catalog link in one tap—no manual copy-paste</span>
                </li>
                <li className="flex items-start text-gray-600">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>Customers browse full catalog, not just status updates</span>
                </li>
                <li className="flex items-start text-gray-600">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>You keep their contact, not WhatsApp Business</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-100 p-8 rounded-2xl shadow-md text-center">
              <InstagramIcon size={48} className="mx-auto mb-6 text-[#E1306C]" />
              <h3 className="text-2xl font-bold mb-4 text-Tonstores-darkblue">Instagram</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start text-gray-600">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>Bio link that shows everything, not just 9 recent posts</span>
                </li>
                <li className="flex items-start text-gray-600">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>Algorithm changes don't kill your business</span>
                </li>
                <li className="flex items-start text-gray-600">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>Orders come to you, not Instagram's system</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-8 rounded-2xl shadow-md text-center">
              <TikTokIcon size={48} className="mx-auto mb-6 text-black" />
              <h3 className="text-2xl font-bold mb-4 text-Tonstores-darkblue">TikTok</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start text-gray-600">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>Sell during lives—viewers buy while watching</span>
                </li>
                <li className="flex items-start text-gray-600">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>No "DM for price" back-and-forth</span>
                </li>
                <li className="flex items-start text-gray-600">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>Platform bans don't erase your customer base</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green z-0"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to <span className="text-Tonstores-green">Own Your Infrastructure</span>?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              10 products free forever. No credit card. Start building in 5 minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="px-8 py-6 bg-white text-Tonstores-darkblue hover:bg-Tonstores-green hover:text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
                  Start Building Free
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="px-8 py-6 text-lg border-white text-white bg-transparent hover:bg-white/10 rounded-xl font-medium">
                  See Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Features;