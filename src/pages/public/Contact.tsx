import { useState, useEffect, useCallback } from "react";
import { useSimpleForm } from "@/hooks/useSimpleForm";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  ArrowRight
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAdminProfile } from "@/hooks/useProfile";
import useAuth from "@/contexts/AuthContext";
import useForceLightMode from "@/hooks/useForceLightMode";

// TikTok icon component
const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
    <path d="M15 8h.01"></path>
    <path d="M15 2v10a4 4 0 0 1-4 4H9"></path>
    <path d="M4 16v-2a2 2 0 0 1 2-2h10"></path>
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

// Default admin contact information as last-resort fallback
const DEFAULT_CONTACTS = {
  email_support: "tonshopdev@proton.me",
  whatsapp_support: "+2349038650178",
  twitter_handle: "RichieDBuilder",
  instagram_handle: "Tonstores",
  facebook_handle: "TonStore",
  tiktok_handle: "tonrichie",
};

const Contact = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use the custom hook to force light mode for logged-out users
  useForceLightMode();

  const { formData, handleChange, resetForm } = useSimpleForm({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin profile for contact information
  useEffect(() => {
    const fetchAdminProfileData = async () => {
      try {
        setIsLoading(true);
        const data = await getAdminProfile();
        if (data) {
          setAdminProfile(data);
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminProfileData();
  }, []);

  // Get contact methods with fallback to defaults
  const getContactMethods = useCallback(() => {
    return {
      email: adminProfile?.email_support || DEFAULT_CONTACTS.email_support,
      whatsapp: adminProfile?.whatsapp_support || DEFAULT_CONTACTS.whatsapp_support,
      twitter: adminProfile?.twitter_handle || DEFAULT_CONTACTS.twitter_handle,
      instagram: adminProfile?.instagram_handle || DEFAULT_CONTACTS.instagram_handle,
      facebook: adminProfile?.facebook_handle || DEFAULT_CONTACTS.facebook_handle,
      tiktok: adminProfile?.tiktok_handle || DEFAULT_CONTACTS.tiktok_handle,
    };
  }, [adminProfile]);

  // Formatting helper functions
  const getWhatsAppLink = (number: string) => {
    const cleanNumber = number.replace(/\s+/g, '');
    return `https://wa.me/${cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber}`;
  };
  const getTwitterLink = (handle: string) =>
    handle.startsWith('http') ? handle : `https://twitter.com/${handle.replace(/^@/, '')}`;
  const getInstagramLink = (handle: string) =>
    handle.startsWith('http') ? handle : `https://instagram.com/${handle.replace(/^@/, '')}`;
  const getFacebookLink = (handle: string) =>
    handle.startsWith('http') ? handle : `https://facebook.com/${handle}`;
  const getTikTokLink = (handle: string) =>
    handle.startsWith('http') ? handle : `https://tiktok.com/@${handle.replace(/^@/, '')}`;


  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for reaching out. We'll get back to you shortly!",
      });
      resetForm();
      setIsSubmitting(false);
    }, 1500);
  };
  
  const contactMethods = getContactMethods();

  const contactInfo = [
    {
      title: "Email Us",
      details: contactMethods.email,
      icon: Mail,
      link: `mailto:${contactMethods.email}`,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Call Us",
      details: contactMethods.whatsapp,
      icon: WhatsAppIcon,
      link: getWhatsAppLink(contactMethods.whatsapp),
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Visit Us",
      details: "123 Idejo Street, Victoria Island, Lagos, Nigeria",
      icon: MapPin,
      link: "https://maps.google.com",
      bgColor: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      title: "Live Chat",
      details: "Available 9am-5pm WAT, Mon-Fri",
      icon: MessageSquare,
      link: "#chat",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  const socialMedia = [
    { 
      name: "Twitter", 
      icon: Twitter, 
      link: getTwitterLink(contactMethods.twitter),
      handle: contactMethods.twitter.replace(/^@/, ''),
      bgColor: "bg-[#1DA1F2]",
      hoverBgColor: "hover:bg-[#0d8bd7]"
    },
    { 
      name: "Instagram", 
      icon: Instagram, 
      link: getInstagramLink(contactMethods.instagram),
      handle: contactMethods.instagram.replace(/^@/, ''),
      bgColor: "bg-[#E4405F]",
      hoverBgColor: "hover:bg-[#d32e4d]"
    },
    { 
      name: "Facebook", 
      icon: Facebook, 
      link: getFacebookLink(contactMethods.facebook),
      handle: contactMethods.facebook,
      bgColor: "bg-[#1877F2]",
      hoverBgColor: "hover:bg-[#0d66d9]"
    },
    {
      name: "TikTok",
      icon: TikTokIcon,
      link: getTikTokLink(contactMethods.tiktok),
      handle: contactMethods.tiktok.replace(/^@/, ''),
      bgColor: "bg-[#000000]",
      hoverBgColor: "hover:bg-[#333333]"
    }
  ];

  return (
    <main className="flex-grow">
      {user && (
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            ← Back to Dashboard
          </Button>
        </div>
      )}

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
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 inline-block mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Get in Touch</h1>
          </div>
          <p className="mt-6 text-xl text-white max-w-3xl mx-auto">
            We'd love to hear from you. Reach out to our team with any questions, feedback, or inquiries.
          </p>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info Column */}
            <div className="md:col-span-1">
              <h2 className="text-2xl md:text-3xl font-bold text-Tonstores-darkblue mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <a href={item.link} key={index} className="flex items-start group">
                    <div className={`${item.bgColor} p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform`}>
                      {typeof item.icon === 'function' && (
                        item.icon === WhatsAppIcon ? 
                          <WhatsAppIcon size={24} className={item.iconColor} /> : 
                          <item.icon className={item.iconColor} size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-Tonstores-darkblue">{item.title}</h3>
                      <p className="text-gray-600">{item.details}</p>
                    </div>
                  </a>
                ))}
              </div>
              
              <h3 className="text-xl font-bold text-Tonstores-darkblue mt-12 mb-6">Follow Us</h3>
              <div className="flex space-x-3">
                {socialMedia.map((platform, index) => (
                  <a 
                    key={index}
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${platform.bgColor} ${platform.hoverBgColor} p-3 rounded-full text-white transition-transform hover:scale-110`}
                  >
                    {platform.icon === TikTokIcon ? 
                      <TikTokIcon size={20} /> : 
                      <platform.icon size={20} />
                    }
                  </a>
                ))}
              </div>
            </div>
            
            {/* Contact Form Column */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl md:text-3xl font-bold text-Tonstores-darkblue mb-2">Send a Message</h2>
                <p className="text-gray-600 mb-6">We'll get back to you within 24 hours</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-Tonstores-green focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-Tonstores-green focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-Tonstores-green focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-Tonstores-green focus:border-transparent"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-6 bg-Tonstores-green hover:bg-Tonstores-darkblue text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Send Message
                          <Send className="ml-2" size={20} />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-Tonstores-darkblue">Find Us</h2>
            <p className="text-gray-600 mt-2">Visit our office in Lagos, Nigeria</p>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-lg max-w-5xl mx-auto">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7292455432513!2d3.4210515757396595!3d6.426185024636028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf53aec4dd92d%3A0x5e34fe6a84cdcd77!2sVictoria%20Island%2C%20Lagos!5e0!3m2!1sen!2sng!4v1698789436302!5m2!1sen!2sng" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Selling?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Create your free account today and transform your social media presence into a powerful sales machine.
          </p>
          <Link to="/register">
            <Button className="px-8 py-6 bg-white text-Tonstores-darkblue hover:bg-Tonstores-green hover:text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
              Create Free Account
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Contact;
