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

const ContactMethods = ({
  contactMethods,
  hasSellerContacts = false,
  getWhatsAppLink,
  getTwitterLink,
  getInstagramLink,
  getFacebookLink,
  getTikTokLink,
}: ContactMethodsProps) => {
  const socials = [
    { label: "Instagram", href: getInstagramLink(contactMethods.instagram), icon: <Instagram size={20} /> },
    { label: "TikTok", href: getTikTokLink(contactMethods.tiktok), icon: <TikTokIcon className="w-5 h-5" /> },
    { label: "Facebook", href: getFacebookLink(contactMethods.facebook), icon: <Facebook size={20} /> },
    { label: "Twitter", href: getTwitterLink(contactMethods.twitter), icon: <Twitter size={20} /> },
  ];

  return (
    <section className="mt-10 bg-card border border-border rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg font-extrabold mb-1">
        {hasSellerContacts ? "Questions before you order?" : "Need help?"}
      </h2>
      <p className="text-muted-foreground text-[15px] mb-4">
        {hasSellerContacts ? "Message the seller directly." : "Our support team is happy to help."}
      </p>

      {/* Primary contact: two equal buttons */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href={getWhatsAppLink(contactMethods.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-12 rounded-lg bg-Tonstores-green hover:bg-Tonstores-greendark text-white text-sm font-bold"
        >
          <Phone size={18} /> WhatsApp
        </a>
        <a
          href={`mailto:${contactMethods.email}`}
          className="flex items-center justify-center gap-2 h-12 rounded-lg border border-border bg-background text-sm font-bold hover:border-Tonstores-green transition-colors"
        >
          <Mail size={18} /> Email
        </a>
      </div>

      {/* Social: four equal tiles */}
      <p className="text-xs font-semibold text-muted-foreground mt-5 mb-2">Follow</p>
      <div className="grid grid-cols-4 gap-3">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="flex flex-col items-center justify-center gap-1.5 h-[72px] rounded-lg border border-border bg-background text-foreground hover:border-Tonstores-green hover:text-Tonstores-green transition-colors"
          >
            {s.icon}
            <span className="text-[11px] font-semibold">{s.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ContactMethods;
