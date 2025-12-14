import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Globe, BarChart, ArrowDown, Shield, Zap, Users } from "lucide-react";
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
        {/* Hero Section - System-Aware Positioning */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green z-0"></div>
          
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
                  <div className="inline-block mb-4">
                    <span className="bg-Tonstores-green/20 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full border border-Tonstores-green/30">
                      For Nigerian Builders
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                    The System Wasn't Built For You. <span className="text-Tonstores-green">Build Anyway.</span>
                  </h1>
                  
                  <div className="w-24 h-1.5 bg-Tonstores-green my-6 rounded-full"></div>
                  
                  <p className="mt-6 text-xl text-blue-100 max-w-2xl leading-relaxed">
                    Banks won't give you merchant accounts. Platforms charge extraction fees. But you have products, customers, and hustle.
                  </p>
                  
                  <p className="mt-4 text-xl text-blue-100 max-w-2xl leading-relaxed">
                    We built the infrastructure you need to look professional, serve customers well, and grow—<span className="text-Tonstores-green font-semibold">without asking permission from anyone.</span>
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-4">
                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Shield className="text-Tonstores-green mr-2" size={20} />
                      <span className="text-sm">Own Your Data</span>
                    </div>
                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Zap className="text-Tonstores-green mr-2" size={20} />
                      <span className="text-sm">Control Your Infrastructure</span>
                    </div>
                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Users className="text-Tonstores-green mr-2" size={20} />
                      <span className="text-sm">Keep Your Customers</span>
                    </div>
                  </div>
               
                  {!user && (
                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                      <Link to="/register">
                        <Button className="px-8 py-6 bg-Tonstores-green hover:bg-white hover:text-Tonstores-darkblue text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl font-medium">
                          Start Building Free
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
                        <Button className="px-8 py-6 bg-Tonstores-green hover:bg-white hover:text-Tonstores-darkblue text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
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
                    <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white/20">
                      <img 
                        src="https://hhxpuadernawdgdrdnok.supabase.co/storage/v1/object/public/profiles/avatars/ChatGPT%20Image%20May%203,%202025,%2012_21_52%20AM.png" 
                        alt="Tonstores Platform" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-Tonstores-green rounded-full opacity-20 blur-xl z-0"></div>
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-400 rounded-full opacity-20 blur-xl z-0"></div>
                    
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
                          <p className="text-xs text-gray-600">Customer Click</p>
                          <p className="text-sm font-medium">Your catalog</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
              <div className="flex flex-col items-center animate-bounce">
                <ArrowDown size={24} />
                <span className="text-sm mt-2 opacity-80">See what you're getting</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* The Problem Section - Name the System */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="bg-red-100 text-red-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                  THE REAL COST OF "FREE" PLATFORMS
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue mb-6">
                  What Managing Three Platforms Actually Costs You
                </h2>
                <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-red-500">
                  <div className="text-4xl font-bold text-red-600 mb-2">5 Hours</div>
                  <div className="text-gray-700 font-medium mb-2">Every Week</div>
                  <p className="text-gray-600 text-sm">
                    Copying product details from Instagram to WhatsApp to TikTok. Manually updating prices in three places. Switching between apps constantly.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-orange-500">
                  <div className="text-4xl font-bold text-orange-600 mb-2">30%</div>
                  <div className="text-gray-700 font-medium mb-2">Lost Sales</div>
                  <p className="text-gray-600 text-sm">
                    Because customers can't find what they want in your scattered posts. Because they asked about a product but you didn't see the DM in time.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-yellow-500">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">₦50K+</div>
                  <div className="text-gray-700 font-medium mb-2">Monthly Cost</div>
                  <p className="text-gray-600 text-sm">
                    From confused customers ordering wrong items. From missing orders because you lost track. From looking unprofessional and losing trust.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 bg-gradient-to-r from-Tonstores-darkblue to-purple-900 text-white p-8 rounded-2xl">
                <p className="text-xl font-medium text-center">
                  Instagram and WhatsApp are "free" until you calculate what chaos actually costs. 
                  <span className="text-Tonstores-green block mt-2">Tonstores Pro is ₦15,000/month. That's less than what one confused customer costs you.</span>
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Value Proposition - Control & Legitimacy */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="bg-Tonstores-green/10 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                WHAT YOU ACTUALLY GET
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue mb-6">
                Own Your Infrastructure. Build Professional Business.
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Not just catalog software. The infrastructure you need to compete without permission.
              </p>
              <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-Tonstores-green/20">
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-Tonstores-green/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <Shield className="text-Tonstores-green" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-Tonstores-darkblue mb-3">Control</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Your customer database stays with you. Your catalog is yours. If Instagram changes the algorithm tomorrow, you're not destroyed—you just route customers through WhatsApp or TikTok because you own the infrastructure.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-Tonstores-green/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-Tonstores-green" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Never lose customer contacts when platforms change policies</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-Tonstores-green/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-Tonstores-green" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Export your data anytime—no platform lock-in</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-Tonstores-green/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-Tonstores-green" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Update once, share everywhere—you control the source</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-200">
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <BarChart className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-Tonstores-darkblue mb-3">Legitimacy</h3>
                    <p className="text-gray-600 leading-relaxed">
                      When customers get a clean catalog link, see organized products with clear prices, complete smooth checkout—they treat you differently. They trust you with bank transfers. They become repeat customers.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Professional catalog that makes customers trust you</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Order management that prevents confusion and refunds</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Look like the established business you're becoming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Platform Integration */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue mb-4">
                One Link. All Your Platforms. Your Control.
              </h2>
              <p className="text-xl text-gray-600">
                Share your catalog everywhere without being dependent on any platform
              </p>
              <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 mx-auto">
                  <InstagramIcon className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-3">Instagram</h3>
                <p className="text-gray-600 text-center">
                  Bio link that looks professional. Customers browse everything easily.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 mx-auto">
                  <WhatsAppIcon className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-3">WhatsApp</h3>
                <p className="text-gray-600 text-center">
                  Share catalogs directly in chats. Customers order without leaving the app.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mb-6 mx-auto">
                  <TikTokIcon className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-3">TikTok</h3>
                <p className="text-gray-600 text-center">
                  Sell during live streams. Viewers click and buy instantly.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 mx-auto">
                  <Globe className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-3">Your Dashboard</h3>
                <p className="text-gray-600 text-center">
                  Track everything from one place. All platforms, all sales.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Success Stories */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="bg-Tonstores-green/10 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                BUILDERS LIKE YOU
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue">
                From Chaos to Control
              </h2>
              <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:-translate-y-2">
                <div className="flex mb-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-Tonstores-green/20 to-Tonstores-darkblue/10 flex items-center justify-center mr-4">
                    <span className="text-Tonstores-green text-2xl font-bold">CE</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-Tonstores-darkblue text-xl">Chidinma E.</h3>
                    <p className="text-sm text-gray-600">Lagos Fashion Seller</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mt-6 relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-Tonstores-green before:rounded-full">
                  "I was spending every Sunday night updating my WhatsApp status with product photos. Tuesday I'd realize I got the price wrong and have to message everyone individually. Now I update once and send one link to all my customer groups. I'm spending 5 hours less per week and closing 30% more sales."
                </p>
                
                <div className="flex mt-6 text-Tonstores-green text-xl">
                  ★★★★★
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Lagos • 3 months with Tonstores • ₦423k weekly sales
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:-translate-y-2">
                <div className="flex mb-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-Tonstores-green/20 to-Tonstores-darkblue/10 flex items-center justify-center mr-4">
                    <span className="text-Tonstores-green text-2xl font-bold">DT</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-Tonstores-darkblue text-xl">David T.</h3>
                    <p className="text-sm text-gray-600">Abuja Electronics Reseller</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mt-6 relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-Tonstores-green before:rounded-full">
                  "Before, people would see my TikTok live and ask 'How do I buy?' I'd say 'DM me' and lose half of them. Now I drop my Tonstores link in the live chat and people buy while I'm still streaming. No 'send your account details' back and forth."
                </p>
                
                <div className="flex mt-6 text-Tonstores-green text-xl">
                  ★★★★★
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Abuja • 5 months with Tonstores • 89 sales this week
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-Tonstores-darkblue">2+</div>
                <div className="text-gray-600 mt-2">Active Builders</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-Tonstores-darkblue">₦300K+</div>
                <div className="text-gray-600 mt-2">Total Sales</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-Tonstores-darkblue">100%</div>
                <div className="text-gray-600 mt-2">Keep Their Data</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-Tonstores-darkblue">24/7</div>
                <div className="text-gray-600 mt-2">Nigeria Support</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Against Extraction Model */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                  WHY WE'RE DIFFERENT
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue mb-6">
                  Most Platforms Want You Dependent. We Want You Independent.
                </h2>
                <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
              </div>
              
              <div className="bg-gray-50 p-8 md:p-12 rounded-2xl border border-gray-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      The Old Way
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Jumia takes your customers and charges you fees while giving you no data</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Instagram changes algorithm, forces you to pay for reach</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>WhatsApp is free until you need features, then you're trapped</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Platform wins, you pay—that's the business model</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-Tonstores-green mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      The Tonstores Way
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-Tonstores-green mr-2">✓</span>
                        <span>You own your customer database—export it anytime</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-Tonstores-green mr-2">✓</span>
                        <span>If Instagram changes, route through WhatsApp. Your infrastructure stays</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-Tonstores-green mr-2">✓</span>
                        <span>₦15,000/month, no hidden fees, no extraction games</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-Tonstores-green mr-2">✓</span>
                        <span>We succeed only if you succeed—aligned interests</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-10 p-6 bg-Tonstores-darkblue text-white rounded-xl">
                  <p className="text-center text-lg">
                    Every platform's business model is the same: <span className="font-bold">free to hook you, then extract value once you're dependent.</span> We inverted that. Small commitment upfront, then we keep earning your business by actually serving you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green z-0"></div>
          
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to <span className="text-Tonstores-green">Own Your Infrastructure</span>?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join Nigerian Builders who stopped asking permission and started building anyway
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto mb-10">
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center text-white">
                    <div className="bg-white/20 rounded-full p-2 mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center text-white">
                    <div className="bg-white/20 rounded-full p-2 mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>10 products free forever</span>
                  </div>
                  <div className="flex items-center text-white">
                    <div className="bg-white/20 rounded-full p-2 mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Your data, your control</span>
                  </div>
                </div>
              </div>
              
              {!user && (
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
              )}
              
              {user && (
                <div>
                  <Link to="/dashboard">
                    <Button className="px-8 py-6 bg-white text-Tonstores-darkblue hover:bg-Tonstores-green hover:text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
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