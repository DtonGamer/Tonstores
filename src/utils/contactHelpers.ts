import { getAdminProfile } from "@/hooks/useProfile";

// Default admin contact information as last-resort fallback
const DEFAULT_CONTACTS = {
  email_support: "Creatorrichie@gmail",
  whatsapp_support: "+239038650178",
  twitter_handle: "RichieDbuilder",
  instagram_handle: "Tonstores",
  facebook_handle: "Tonstore",
  tiktok_handle: "tonrichie",
};
/**
 * Helper function to format WhatsApp links
 */
export const formatWhatsAppLink = (number: string): string => {
  if (!number) return '';
  const cleanNumber = number.replace(/\s+/g, '');
  return `https://wa.me/${cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber}`;
};

/**
 * Helper function to format Twitter links
 */
export const formatTwitterLink = (handle: string): string => {
  if (!handle) return '';
  if (handle.startsWith('http')) return handle;
  return `https://twitter.com/${handle.startsWith('@') ? handle.substring(1) : handle}`;
};

/**
 * Helper function to format Instagram links
 */
export const formatInstagramLink = (handle: string): string => {
  if (!handle) return '';
  if (handle.startsWith('http')) return handle;
  return `https://instagram.com/${handle.startsWith('@') ? handle.substring(1) : handle}`;
};

/**
 * Helper function to format Facebook links
 */
export const formatFacebookLink = (handle: string): string => {
  if (!handle) return '';
  if (handle.startsWith('http')) return handle;
  return `https://facebook.com/${handle}`;
};

/**
 * Format TikTok handle to a valid URL
 */
export const formatTikTokLink = (handle: string) => {
  if (!handle) return '';
  if (handle.startsWith('http')) return handle;
  return `https://tiktok.com/@${handle.replace(/^@/, '')}`;
};

/**
 * Get contact methods with fallbacks in order:
 * 1. Use seller/user profile values if available
 * 2. Fallback to admin profile values if available
 * 3. Fallback to default constants as last resort
 */
export const getContactMethods = async (userProfile: any) => {
  // Get admin profile for fallback
  const adminProfile = await getAdminProfile();
  
  return {
    email: userProfile?.email_support || adminProfile?.email_support || DEFAULT_CONTACTS.email_support,
    whatsapp: userProfile?.whatsapp_support || adminProfile?.whatsapp_support || DEFAULT_CONTACTS.whatsapp_support,
    twitter: userProfile?.twitter_handle || adminProfile?.twitter_handle || DEFAULT_CONTACTS.twitter_handle,
    instagram: userProfile?.instagram_handle || adminProfile?.instagram_handle || DEFAULT_CONTACTS.instagram_handle,
    facebook: userProfile?.facebook_handle || adminProfile?.facebook_handle || DEFAULT_CONTACTS.facebook_handle,
    tiktok: userProfile?.tiktok_handle || adminProfile?.tiktok_handle || DEFAULT_CONTACTS.tiktok_handle,
  };
};

/**
 * Get formatted contact links with fallback handling
 */
export const getFormattedContactLinks = async (userProfile: any) => {
  const methods = await getContactMethods(userProfile);
  
  return {
    email: methods.email,
    emailLink: `mailto:${methods.email}`,
    whatsapp: methods.whatsapp,
    whatsappLink: formatWhatsAppLink(methods.whatsapp),
    twitter: methods.twitter,
    twitterLink: formatTwitterLink(methods.twitter),
    instagram: methods.instagram,
    instagramLink: formatInstagramLink(methods.instagram),
    facebook: methods.facebook,
    facebookLink: formatFacebookLink(methods.facebook),
    tiktok: methods.tiktok,
    tiktokLink: formatTikTokLink(methods.tiktok),
  };
}; 