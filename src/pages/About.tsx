import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, Heart, ShieldCheck, TrendingUp, MessageSquare, ArrowRight } from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Richie Ton",
      position: "CEO & Founder",
      bio: "Vibe coder and Ai specialist, building programs in e-commerce and fintech that move our African market forward.",
      image: "/images/team/placeholder.jpg"
    },
    {
      name: "Tunde Bakare",
      position: "Chief Technology Officer",
      bio: "Software engineer with expertise in developing scalable e-commerce solutions for African markets.",
      image: "/images/team/placeholder.jpg"
    },
    {
      name: "Chioma Eze",
      position: "Head of Customer Success",
      bio: "Passionate about helping small businesses grow through technology and digital transformation.",
      image: "/images/team/placeholder.jpg"
    }
  ];

  const values = [
    {
      title: "Empower Local Businesses",
      description: "We're committed to empowering Nigerian small businesses with tools to compete in the digital economy.",
      icon: TrendingUp
    },
    {
      title: "Customer-Centric",
      description: "We put our merchants and their customers at the center of every decision we make.",
      icon: Heart
    },
    {
      title: "Trust & Reliability",
      description: "We build secure, reliable systems that our users can depend on for their livelihood.",
      icon: ShieldCheck
    },
    {
      title: "African Solutions",
      description: "We build specifically for African markets, considering local challenges and opportunities.",
      icon: Globe
    }
  ];

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tonstores-darkblue via-purple-900 to-tonstores-green z-0 opacity-90"></div>
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 inline-block mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">About Tonstores</h1>
          </div>
          <p className="mt-6 text-xl text-white max-w-3xl mx-auto">
            Empowering Nigerian businesses to sell more effectively through WhatsApp and beyond.
          </p>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="bg-tonstores-green/10 text-tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
              OUR PURPOSE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-tonstores-darkblue mb-6">Our Mission</h2>
            <div className="w-24 h-1 bg-tonstores-green mx-auto my-6 rounded-full"></div>
            <p className="text-xl text-gray-600 leading-relaxed">
              TonStores was founded with a simple mission: to help Nigerian businesses sell more effectively through WhatsApp, 
              the platform where most of their customers already spend their time.
            </p>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              We believe that by providing simple, affordable tools that work with existing behavior patterns, 
              we can help businesses of all sizes grow and prosper in the digital economy.
            </p>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
              OUR PRINCIPLES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-tonstores-darkblue mb-4">Core Values</h2>
            <p className="text-xl text-gray-600">
              What drives us every day
            </p>
            <div className="w-24 h-1 bg-tonstores-green mx-auto my-6 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tonstores-green/20 to-tonstores-darkblue/10 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <value.icon className="text-tonstores-green" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-tonstores-darkblue text-center">{value.title}</h3>
                <p className="text-gray-600 text-center">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="bg-tonstores-green/10 text-tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
              OUR TEAM
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-tonstores-darkblue">Meet Our Leaders</h2>
            <div className="w-24 h-1 bg-tonstores-green mx-auto my-6 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-all border border-gray-100">
                <div className="h-48 bg-gradient-to-br from-tonstores-darkblue to-tonstores-green relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="text-white/80 text-sm">{member.position}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="bg-purple-100 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                OUR JOURNEY
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-tonstores-darkblue">Our Story</h2>
              <div className="w-24 h-1 bg-tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="prose prose-lg mx-auto bg-white p-8 rounded-2xl shadow-md">
              <p>
                TonStores was born out of frustration. Our founder, Richie, was helping a friend sell products through WhatsApp 
                and noticed how cumbersome the process was – sending individual product photos, manually tracking orders, and 
                struggling with payment collection.
              </p>
              
              <p className="mt-4">
                He realized that thousands of Nigerian businesses face the same challenges daily. While big businesses have 
                access to sophisticated e-commerce tools, small merchants selling through WhatsApp were left behind.
              </p>
              
              <p className="mt-4">
                In 2023, TonStores was launched with a simple catalog builder and WhatsApp sharing feature. Today, we've 
                grown to serve thousands of merchants across Nigeria, processing millions of naira in transactions monthly.
              </p>
              
              <p className="mt-4">
                Our journey has just begun, and we're excited to continue building solutions that help Nigerian businesses 
                thrive in the digital economy.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact CTA Section */}
      <section className="py-16 bg-gradient-to-br from-tonstores-darkblue via-purple-900 to-tonstores-green">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Join Us?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Start selling on social media with TonStores today and transform your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="px-8 py-6 bg-white text-tonstores-darkblue hover:bg-tonstores-green hover:text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
                Create Free Account
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="px-8 py-6 text-lg border-white text-white bg-transparent hover:bg-white/10 rounded-xl font-medium">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About; 