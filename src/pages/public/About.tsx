import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Database, TrendingUp, Users, Target, Zap, ArrowRight } from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Richie Ton",
      position: "Founder & Builder",
      bio: "Building infrastructure for people the system excluded. Vibe coder who believes excluded Builders deserve tools as good as anyone else's.",
      image: "/images/team/placeholder.jpg"
    }
  ];

  const values = [
    {
      title: "Infrastructure for the Excluded",
      description: "We build for Builders who were told to wait their turn. If banks won't serve you, we will.",
      icon: Shield
    },
    {
      title: "You Own Your Data",
      description: "Your customers, your catalog, your control. We don't extract value from your dependency.",
      icon: Database
    },
    {
      title: "Aligned Interests",
      description: "We succeed only when you succeed. No extraction games, no hidden fees, no platform lock-in.",
      icon: Target
    },
    {
      title: "Built for Reality",
      description: "Built for Lagos hustlers managing 50 products across WhatsApp and Instagram, not Silicon Valley ideals.",
      icon: Zap
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
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block mb-4">
            <span className="bg-Tonstores-green/20 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full border border-Tonstores-green/30">
              Infrastructure for Builders
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About <span className="text-Tonstores-green">Tonstores</span>
          </h1>
          <div className="w-24 h-1.5 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
            We build tools for people creating real businesses despite inadequate infrastructure, not for those waiting for permission to participate.
          </p>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="bg-Tonstores-green/10 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                WHY WE EXIST
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue mb-6">Our Mission</h2>
              <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 md:p-12 rounded-2xl border border-gray-200">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                The banking system serves the big. The charity system serves the desperately poor. But there's this massive middle—people running real businesses, generating real revenue, serving real customers—who are <span className="font-bold text-Tonstores-darkblue">too big for charity but too small for the system to bother with</span>.
              </p>
              
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                We call them <span className="font-bold text-Tonstores-green">Builders</span>. Not entrepreneurs (too aspirational). Not vendors (too small-sounding). Builders. People building real businesses with inadequate infrastructure.
              </p>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                Tonstores exists to give Builders the infrastructure they need to compete without asking permission from platforms or banks. <span className="font-bold text-Tonstores-darkblue">Control + Legitimacy = Independence</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
              WHAT WE BELIEVE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue mb-4">Core Principles</h2>
            <p className="text-xl text-gray-600">
              Not just values—commitments we keep
            </p>
            <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-Tonstores-green/20 to-Tonstores-darkblue/10 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <value.icon className="text-Tonstores-green" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-Tonstores-darkblue text-center">{value.title}</h3>
                <p className="text-gray-600 text-center text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="bg-purple-100 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                HOW WE STARTED
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue">The Origin Story</h2>
              <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  Tonstores was born from watching a friend try to sell products through WhatsApp. She'd spend every Sunday night updating her WhatsApp status with product photos and prices. By Tuesday, she'd realize she got the price wrong and have to message everyone individually.
                </p>
                
                <p>
                  She was making ₦300,000 monthly selling fashion items. Good money. Real customers. But when she went to banks for a merchant account, they told her she was "too small." When she tried Shopify, the pricing was for Western markets. When she used Instagram, the algorithm kept changing and killing her reach.
                </p>
                
                <p className="font-semibold text-Tonstores-darkblue">
                  She was building a real business in the cracks between system organs, in the gaps where control mechanisms don't reach.
                </p>
                
                <p>
                  Thousands of Nigerian Builders face this daily. The banking system excludes them. Big platforms extract from them. They need infrastructure, but everything is built for either massive corporations or Silicon Valley startups.
                </p>
                
                <p>
                  So we built Tonstores. Not just another catalog tool—<span className="font-semibold text-Tonstores-green">infrastructure for people the system decided weren't worth serving</span>. Infrastructure you own. Infrastructure that doesn't require permission.
                </p>
                
                <p>
                  We're not trying to be the next unicorn. We're trying to give Builders the tools they need to compete without asking gatekeepers for approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="bg-Tonstores-green/10 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
              WHO'S BUILDING THIS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue">Meet the Builder</h2>
            <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="h-64 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-3xl font-bold mb-2">{member.name}</h3>
                    <p className="text-white/90 text-lg">{member.position}</p>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-700 text-lg leading-relaxed">{member.bio}</p>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-gray-600 italic">
                      "If the system won't build infrastructure for excluded Builders, we will. They deserve tools as good as anyone else's."
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue mb-6">
                What Makes Us Different
              </h2>
              <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-Tonstores-green">
                <h3 className="font-bold text-lg text-Tonstores-darkblue mb-3">We're Not Neutral</h3>
                <p className="text-gray-700">
                  Most SaaS companies try to serve everyone. We explicitly serve Builders excluded by traditional gatekeepers. That's a position, not neutrality.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-Tonstores-green">
                <h3 className="font-bold text-lg text-Tonstores-darkblue mb-3">You Own Everything</h3>
                <p className="text-gray-700">
                  Your data. Your customers. Your catalog. Export anytime. No lock-in. We earn your business by serving you, not by trapping you.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-Tonstores-green">
                <h3 className="font-bold text-lg text-Tonstores-darkblue mb-3">Built for Nigerian Reality</h3>
                <p className="text-gray-700">
                  Not adapted from Western markets. Built for people managing products across WhatsApp, Instagram, and TikTok while dealing with Nigerian payment systems.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-Tonstores-green">
                <h3 className="font-bold text-lg text-Tonstores-darkblue mb-3">Aligned Interests</h3>
                <p className="text-gray-700">
                  We don't profit from your dependency. Small upfront commitment, then we keep earning your business monthly by actually serving you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join the Builders?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Stop waiting for permission. Start building your infrastructure today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="px-8 py-6 bg-white text-Tonstores-darkblue hover:bg-Tonstores-green hover:text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
                Start Building Free
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="px-8 py-6 text-lg border-white text-white bg-transparent hover:bg-white/10 rounded-xl font-medium">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;