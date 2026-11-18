import { Mail, Phone, Twitter, Instagram, Facebook } from "lucide-react";
import TikTokIcon from "./tiktokIcon";

interface ContactMethodsProps {
  contactMethods: {
    email?: string;
    whatsapp?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  hasSellerContacts?: boolean;
  getWhatsAppLink: (number: string) => string;
  getTwitterLink: (handle: string) => string;
  getInstagramLink: (handle: string) => string;
  getFacebookLink: (handle: string) => string;
  getTikTokLink: (handle: string) => string;
}

// Static class names so Tailwind can detect them
const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const ContactMethods = ({
  contactMethods,
  hasSellerContacts = false,
  getWhatsAppLink,
  getTwitterLink,
  getInstagramLink,
  getFacebookLink,
  getTikTokLink,
}: ContactMethodsProps) => {
  const { email, whatsapp, instagram, tiktok, facebook, twitter } = contactMethods;

  // Only include a social when the seller has set a handle/URL
  const socials = [
    instagram && { label: "Instagram", href: getInstagramLink(instagram), icon: <Instagram size={20} /> },
    tiktok && { label: "TikTok", href: getTikTokLink(tiktok), icon: <TikTokIcon className="w-5 h-5" /> },
    facebook && { label: "Facebook", href: getFacebookLink(facebook), icon: <Facebook size={20} /> },
    twitter && { label: "Twitter", href: getTwitterLink(twitter), icon: <Twitter size={20} /> },
  ].filter(Boolean) as { label: string; href: string; icon: JSX.Element }[];

  const primaryCount = (whatsapp ? 1 : 0) + (email ? 1 : 0);

  // Nothing to show: hide the whole card
  if (primaryCount === 0 && socials.length === 0) return null;

  return (
    <section className="mt-10 bg-card border border-border rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg font-extrabold mb-1">
        {hasSellerContacts ? "Questions before you order?" : "Need help?"}
      </h2>
      <p className="text-muted-foreground text-[15px] mb-4">
        {hasSellerContacts ? "Message the seller directly." : "Our support team is happy to help."}
      </p>

      {/* Primary contact */}
      {primaryCount > 0 && (
        <div className={`grid ${COLS[primaryCount]} gap-3`}>
          {whatsapp && (
            <a
              href={getWhatsAppLink(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 rounded-lg bg-Tonstores-green hover:bg-Tonstores-greendark text-white text-sm font-bold"
            >
              <Phone size={18} /> WhatsApp
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center justify-center gap-2 h-12 rounded-lg border border-border bg-background text-sm font-bold hover:border-Tonstores-green transition-colors"
            >
              <Mail size={18} /> Email
            </a>
          )}
        </div>
      )}

      {/* Social: only the ones the seller has set up */}
      {socials.length > 0 && (
        <>
          <p className={`text-xs font-semibold text-muted-foreground mb-2 ${primaryCount > 0 ? "mt-5" : ""}`}>
            Follow
          </p>
          <div className={`grid ${COLS[socials.length]} gap-3`}>
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
        </>
      )}
    </section>
  );
};

export default ContactMethods;
