import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Globe, BarChart, ArrowDown } from "lucide-react";
import useAuth from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

// Custom icon components
const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M19.321 5.562a5.124 5.124 0 0 1-1.38 1.015 5.086 5.086 0 0 1-1.616.518V9.39a5.052 5.052 0 0 1-2.299-.56v3.947a5.16 5.16 0 0 1-1.378 3.53 5.2 5.2 0 0 1-7.313.01 5.161 5.161 0 0 1 0-7.313 5.2 5.2 0 0 1 7.313.01c.011.01.02.022.03.032V5.332A9.885 9.885 0 0 0 10.95 4.4a9.9 9.9 0 0 0-5.213 1.495 9.938 9.938 0 0 0-3.595 4.144A9.892 9.892 0 0 0 1.2 14.91a9.958 9.958 0 0 0 2.892 7.024 9.958 9.958 0 0 0 6.817 2.866h.082a9.958 9.958 0 0 0 7.024-2.866 9.958 9.958 0 0 0 2.866-7.024V8.593a9.885 9.885 0 0 0 4.92 1.3V5.783a5.07 5.07 0 0 1-2.766-.768 5.16 5.16 0 0 1-1.815-1.816 5.07 5.07 0 0 1-.769-2.766h-3.109c.002 1.088.287 2.156.829 3.13z" 
    fill="currentColor" />
  </svg>
);

// WhatsApp icon component
const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4.02a7.94 7.94 0 0 0-7.04 11.62L4 20.98l5.4-.96a7.93 7.93 0 0 0 3.8.97h.04A7.94 7.94 0 0 0 17.6 6.32zm-5.57 12.17h-.03a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.59 6.59 0 0 1-1.01-3.49 6.59 6.59 0 0 1 6.59-6.59 6.56 6.56 0 0 1 4.66 1.93 6.52 6.52 0 0 1 1.93 4.67 6.6 6.6 0 0 1-6.55 6.57zm3.61-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.78-.11.13-.23.15-.43.05a5.47 5.47 0 0 1-1.6-.99 6 6 0 0 1-1.11-1.38c-.12-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.14.03-.26-.02-.36-.05-.1-.45-1.08-.62-1.47-.16-.39-.33-.33-.45-.34-.12-.01-.25-.01-.38-.01-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63 0 .96.7 1.9.8 2.03.1.14 1.37 2.1 3.32 2.94.46.2.83.32 1.11.41.47.15.89.13 1.23.08.37-.06 1.15-.47 1.31-.93.16-.46.16-.85.11-.93-.05-.08-.19-.13-.4-.23z" 
    fill="currentColor" />
  </svg>
);

// Instagram icon component
const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M6.77 3.082a47.472 47.472 0 0 1 10.46 0c1.806.204 3.27 1.655 3.458 3.472a45.61 45.61 0 0 1 0 10.892c-.188 1.817-1.652 3.268-3.458 3.472a47.468 47.468 0 0 1-10.46 0c-1.806-.204-3.27-1.655-3.458-3.472a45.614 45.614 0 0 1 0-10.892C3.5 4.737 4.964 3.286 6.77 3.082zM17 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-9.75 6a4.75 4.75 0 1 1 9.5 0 4.75 4.75 0 0 1-9.5 0z" fill="currentColor" />
  </svg>
);

const Index = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        {/* Hero Section - Modern Design */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-tonstores-darkblue via-purple-900 to-tonstores-green z-0"></div>
          
          {/* Geometric pattern overlay */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm0 0c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px'
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 text-white">
                <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    Turn Social Media Into Your <span className="text-tonstores-green">24/7 Sales Machine</span>
                </h1>
                  <div className="w-24 h-1.5 bg-tonstores-green my-6 rounded-full"></div>
                  <p className="mt-6 text-xl text-blue-100 max-w-2xl">
                  Create beautiful product catalogs → Share one link on WhatsApp, Instagram & TikTok → Get paid instantly.
                </p>
                  <p className="font-bold mt-6 text-xl text-tonstores-green bg-white/10 inline-block px-4 py-2 rounded-full">Zero coding. Zero Wahala.</p>
                
               {!user && (
                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                      <Button className="px-8 py-6 bg-tonstores-green hover:bg-white hover:text-tonstores-darkblue text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl font-medium">
                      Start Selling Now
                        <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                  <Link to="/features">
                      <Button variant="outline" className="px-8 py-6 text-lg border-white/50 text-white bg-transparent hover:bg-white/10 hover:border-white rounded-xl font-medium">
                      See How It Works
                    </Button>
                  </Link>
                </div>
               )}
               
               {user && (
                  <div className="mt-10">
                  <Link to="/dashboard">
                      <Button className="px-8 py-6 bg-tonstores-green hover:bg-white hover:text-tonstores-darkblue text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
                      Go to Dashboard
                        <LayoutDashboard className="ml-2" size={20} />
                    </Button>
                  </Link>
                </div>
               )}
              </div>
              </div>
              
              <div className="lg:w-1/2">
                <div className={`transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <div className="relative">
                    {/* Phone mockup with floating effect */}
                    <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white/20">
                <img 
                  src="https://hhxpuadernawdgdrdnok.supabase.co/storage/v1/object/public/profiles/avatars/ChatGPT%20Image%20May%203,%202025,%2012_21_52%20AM.png" 
                  alt="TonStores Platform" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-tonstores-green rounded-full opacity-20 blur-xl z-0"></div>
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-400 rounded-full opacity-20 blur-xl z-0"></div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-8 -right-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg z-20 animate-pulse">
                      <div className="flex items-center">
                        <div className="bg-green-500 rounded-full p-2 mr-3">
                          <WhatsAppIcon className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">New Order</p>
                          <p className="text-sm font-medium">₦42,500</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-8 left-10 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg z-20 animate-pulse">
                      <div className="flex items-center">
                        <div className="bg-purple-500 rounded-full p-2 mr-3">
                          <InstagramIcon className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">New Follower</p>
                          <p className="text-sm font-medium">+24 today</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
              <div className="flex flex-col items-center animate-bounce">
                <ArrowDown size={24} />
                <span className="text-sm mt-2 opacity-80">Scroll to learn more</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Social Platform Integration - Card Style */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-tonstores-darkblue mb-4">
                Sell Anywhere Your Customers Are
              </h2>
              <p className="text-xl text-gray-600">
                One link for all your social platforms
              </p>
              <div className="w-24 h-1 bg-tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 mx-auto">
                  <WhatsAppIcon className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-3">WhatsApp</h3>
                <p className="text-gray-600 text-center">
                  Convert chat inquiries into sales with seamless checkout
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mb-6 mx-auto">
                  <InstagramIcon className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-3">Instagram</h3>
                <p className="text-gray-600 text-center">
                  Turn your bio link into a full store with instant checkout
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mb-6 mx-auto">
                  <TikTokIcon className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-3">TikTok</h3>
                <p className="text-gray-600 text-center">
                  Let viewers purchase during live streams with one link
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 mx-auto">
                  <Globe className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-3">All Platforms</h3>
                <p className="text-gray-600 text-center">
                  Unified dashboard to track all sales and analytics
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section - Modern Card Design */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="bg-tonstores-green/10 text-tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                SUCCESS STORIES
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-tonstores-darkblue">
                Why Nigerian Sellers  Will Love Us
              </h2>
              <div className="w-24 h-1 bg-tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:-translate-y-2">
                <div className="flex mb-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tonstores-green/20 to-tonstores-darkblue/10 flex items-center justify-center mr-4">
                    <span className="text-tonstores-green text-2xl font-bold">CE</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-tonstores-darkblue text-xl">Chidinma E.</h3>
                    <p className="text-sm text-gray-600">Lagos Fashion Store</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mt-6 relative pl-6 before:content-['\22'] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-tonstores-green before:rounded-full">
                    "Before Tonstores, I missed 50+ sales daily tracking DMs. Now I make ₦423k/week while cooking dinner!"
                  </p>
                
                <div className="flex mt-6 text-tonstores-green text-xl">
                  ★★★★★
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Joined 3 months ago • 142 sales this month
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:-translate-y-2">
                <div className="flex mb-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tonstores-green/20 to-tonstores-darkblue/10 flex items-center justify-center mr-4">
                    <span className="text-tonstores-green text-2xl font-bold">DT</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-tonstores-darkblue text-xl">David T.</h3>
                    <p className="text-sm text-gray-600">Abuja Gadget Hub</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mt-6 relative pl-6 before:content-['\22'] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-tonstores-green before:rounded-full">
                    "My TikTok live viewers buy BEFORE my video ends! No 'send bank details' stress."
                  </p>
                
                <div className="flex mt-6 text-tonstores-green text-xl">
                  ★★★★★
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Joined 5 months ago • 89 sales this week
                </div>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-tonstores-darkblue">2</div>
                <div className="text-gray-600 mt-2">Nigerian Sellers</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-tonstores-darkblue">₦300K+</div>
                <div className="text-gray-600 mt-2">Total Sales</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-tonstores-darkblue">100%</div>
                <div className="text-gray-600 mt-2">Happy Customers</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-tonstores-darkblue">24/7</div>
                <div className="text-gray-600 mt-2">Support</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Platform Comparison - Modern Card Design */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                ONE LINK FOR ALL
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-tonstores-darkblue">
                Sell Where Nigerians Shop
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Connect with customers wherever they are with a single link
              </p>
              <div className="w-24 h-1 bg-tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {['WhatsApp', 'Instagram', 'TikTok', 'Dashboard'].map((platform, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-gradient-to-br group-hover:scale-110 transition-transform"
                    style={
                      platform === 'WhatsApp' ? {background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'} :
                      platform === 'Instagram' ? {background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'} :
                      platform === 'TikTok' ? {background: 'linear-gradient(135deg, #010101 0%, #69C9D0 100%)'} :
                      {background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'}
                    }>
                    {platform === 'WhatsApp' && <WhatsAppIcon className="text-white" size={32} />}
                    {platform === 'Instagram' && <InstagramIcon className="text-white" size={32} />}
                    {platform === 'TikTok' && <TikTokIcon className="text-white" size={32} />}
                    {platform === 'Dashboard' && <BarChart className="text-white" size={32} />}
                </div>
                  <h3 className="font-bold text-xl mb-3 text-tonstores-darkblue text-center">{platform} {platform === 'Dashboard' ? 'Analytics' : ''}</h3>
                  <p className="text-gray-600 mb-6 text-center">
                    {platform === 'WhatsApp' ? 'Convert chat inquiries into instant sales' :
                     platform === 'Instagram' ? 'Transform your bio link into a full store' :
                     platform === 'TikTok' ? 'Sell during live streams with one link' :
                     'Track all sales and analytics from one place'}
                </p>
                  <div className="text-tonstores-green font-medium flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-current">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/>
                    </svg>
                    {platform === 'Dashboard' ? 'Included' : 'Supported'}
              </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section - Modern Gradient */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-tonstores-darkblue via-purple-900 to-tonstores-green z-0"></div>
          
          {/* Geometric pattern */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to <span className="text-tonstores-green">Sell Everywhere</span>?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join thousands of Nigerian businesses using TonStores to boost their sales
            </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto mb-10">
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center text-white">
                    <div className="bg-white/20 rounded-full p-2 mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center text-white">
                    <div className="bg-white/20 rounded-full p-2 mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Free for first 10 products</span>
                  </div>
                  <div className="flex items-center text-white">
                    <div className="bg-white/20 rounded-full p-2 mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>24/7 Nigerian support</span>
                  </div>
                </div>
              </div>
              
            {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                    <Button className="px-8 py-6 bg-white text-tonstores-darkblue hover:bg-tonstores-green hover:text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
                    Create Free Account
                      <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                  <Link to="/features">
                    <Button variant="outline" className="px-8 py-6 text-lg border-white text-white bg-transparent hover:bg-white/10 rounded-xl font-medium">
                      Explore Features
                  </Button>
                </Link>
              </div>
            )}
              
            {user && (
                <div>
                <Link to="/dashboard">
                    <Button className="px-8 py-6 bg-white text-tonstores-darkblue hover:bg-tonstores-green hover:text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
                    Access Your Dashboard
                      <LayoutDashboard className="ml-2" size={20} />
                  </Button>
                </Link>
              </div>
            )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;