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
  hasSellerContacts?: boolean;
  getWhatsAppLink: (number: string) => string;
  getTwitterLink: (handle: string) => string;
  getInstagramLink: (handle: string) => string;
  getFacebookLink: (handle: string) => string;
  getTikTokLink: (handle: string) => string;
}

const pill = "inline-flex items-center gap-2 border border-border bg-card rounded-lg px-3.5 py-2 text-sm font-semibold hover:border-Tonstores-green transition-colors";

const ContactMethods = ({
  contactMethods,
  hasSellerContacts = false,
  getWhatsAppLink,
  getTwitterLink,
  getInstagramLink,
  getFacebookLink,
  getTikTokLink,
}: ContactMethodsProps) => {
  return (
    <section className="mt-10 bg-card border border-border rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg font-extrabold mb-1">
        {hasSellerContacts ? "Questions before you order?" : "Need help?"}
      </h2>
      <p className="text-muted-foreground text-[15px] mb-4">
        {hasSellerContacts ? "Message the seller directly." : "Our support team is happy to help."}
      </p>

      <div className="flex flex-wrap gap-2">
        <a
          href={getWhatsAppLink(contactMethods.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-Tonstores-green hover:bg-Tonstores-greendark text-white rounded-lg px-4 py-2 text-sm font-bold"
        >
          <Phone size={16} /> WhatsApp
        </a>
        <a href={`mailto:${contactMethods.email}`} className={pill}>
          <Mail size={16} /> Email
        </a>
        <a href={getInstagramLink(contactMethods.instagram)} target="_blank" rel="noopener noreferrer" className={pill}>
          <Instagram size={16} /> Instagram
        </a>
        <a href={getTikTokLink(contactMethods.tiktok)} target="_blank" rel="noopener noreferrer" className={pill}>
          <TikTokIcon className="w-4 h-4" /> TikTok
        </a>
        <a href={getFacebookLink(contactMethods.facebook)} target="_blank" rel="noopener noreferrer" className={pill}>
          <Facebook size={16} /> Facebook
        </a>
        <a href={getTwitterLink(contactMethods.twitter)} target="_blank" rel="noopener noreferrer" className={pill}>
          <Twitter size={16} /> Twitter
        </a>
      </div>
    </section>
  );
};

export default ContactMethods;
