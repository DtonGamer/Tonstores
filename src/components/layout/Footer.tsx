import { Github, Heart, Mail, Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "@/contexts/AuthContext";

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

// TikTok icon component
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

export function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { user } = useAuth();
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    
    // Force light mode for logged-out users
    if (!user) {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);
  
  // If in Dashboard mode, show a simple footer
  if (user) {
    return (
      <footer className="w-full border-t bg-background px-4 py-6 mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Tonstores. All rights reserved.
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </a>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/DtonGamer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="mailto:tonshopdev@proton.me"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                Built with <Heart size={12} className="text-red-500 fill-current" /> in Nigeria
              </span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Public facing modern footer for non-authenticated users
  return (
    <footer className="bg-Tonstores-darkblue text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold">Tonstores</h3>
            <p className="mt-4 text-gray-300 max-w-md">
              The easiest way to sell on social media for Nigerian businesses
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="https://wa.me/2349038650178" className="text-gray-300 hover:text-white transition-colors" aria-label="WhatsApp">
                <WhatsAppIcon size={20} />
              </a>
              <a href="https://instagram.com/Tonstores" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://tiktok.com/@tonrichie" className="text-gray-300 hover:text-white transition-colors" aria-label="TikTok">
                <TikTokIcon size={20} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              </li>
              <li>
                <a href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              </li>
              <li>
                <a href="/testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-Tonstores-green" />
                <a href="mailto:tonshopdev@proton.me" className="text-gray-300 hover:text-white transition-colors">
                  tonshopdev@proton.me
                </a>
              </li>
              <li className="flex items-center gap-2">
                <WhatsAppIcon size={16} className="text-Tonstores-green" />
                <a href="https://wa.me/2349038650178" className="text-gray-300 hover:text-white transition-colors">
                  +234 903 865 0178
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Tonstores. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-gray-400 text-sm mt-4 md:mt-0">
            Built with <Heart size={12} className="text-red-500 fill-current" /> in Nigeria
          </div>
        </div>
      </div>
    </footer>
  );
}
