import { Mail, Phone, Twitter, Instagram, Facebook } from "lucide-react";
import TikTokIcon from "./tiktokIcon";

interface ContactMethodsProps {
  contactMethods: {
    email: string;
    whatsapp: string;
    twitter: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  getWhatsAppLink: (number: string) => string;
  getTwitterLink: (handle: string) => string;
  getInstagramLink: (handle: string) => string;
  getFacebookLink: (handle: string) => string;
  getTikTokLink: (handle: string) => string;
}

const ContactMethods = ({
  contactMethods,
  getWhatsAppLink,
  getTwitterLink,
  getInstagramLink,
  getFacebookLink,
  getTikTokLink
}: ContactMethodsProps) => {
  return (
    <div className="mt-8 border-t dark:border-gray-700 pt-6">
      <div className="text-center mb-4">
        <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white">Need Support?</h3>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm max-w-lg mx-auto">Our support team is available to assist you with any questions.</p>
      </div>

      {/* Primary Contact Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto mb-3">
        {/* Email Support */}
        <a
          href={`mailto:${contactMethods.email}`}
          className="flex items-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-md transition-all border border-blue-200 dark:border-blue-700 group"
        >
          <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
            <Mail className="text-white w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-sm font-semibold dark:text-white">Email Support</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Get help via email</span>
          </div>
        </a>

        {/* WhatsApp Support */}
        <a
          href={getWhatsAppLink(contactMethods.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-md transition-all border border-green-200 dark:border-green-700 group"
        >
          <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
            <Phone className="text-white w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-sm font-semibold dark:text-white">WhatsApp</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Chat with us now</span>
          </div>
        </a>
      </div>

      {/* Social Media Links */}
      <div className="max-w-xl mx-auto">
        <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Follow us on social media</p>
        <div className="grid grid-cols-4 gap-2">
          {/* Twitter */}
          <a
            href={getTwitterLink(contactMethods.twitter)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 group"
          >
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Twitter className="text-blue-500 dark:text-blue-400 w-4 h-4" />
            </div>
            <span className="text-xs font-medium dark:text-white">Twitter</span>
          </a>

          {/* Instagram */}
          <a
            href={getInstagramLink(contactMethods.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 group"
          >
            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Instagram className="text-pink-500 dark:text-pink-400 w-4 h-4" />
            </div>
            <span className="text-xs font-medium dark:text-white">Instagram</span>
          </a>

          {/* Facebook */}
          <a
            href={getFacebookLink(contactMethods.facebook)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 group"
          >
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Facebook className="text-blue-600 dark:text-blue-400 w-4 h-4" />
            </div>
            <span className="text-xs font-medium dark:text-white">Facebook</span>
          </a>

          {/* TikTok */}
          <a
            href={getTikTokLink(contactMethods.tiktok)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 group"
          >
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <TikTokIcon className="text-gray-800 dark:text-gray-200 w-4 h-4" />
            </div>
            <span className="text-xs font-medium dark:text-white">TikTok</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactMethods;