import { supabase } from "@/integrations/supabase/client";

/**
 * Converts a relative image path to a full Supabase storage URL
 * @param imagePath The image path or URL
 * @param bucketName The Supabase storage bucket name (default: 'product-images')
 * @returns The full URL to the image or null if the image path is invalid
 */
export const getStorageUrl = (
  imagePath: string | null, 
  bucketName: string = 'product-images'
): string | null => {
  if (!imagePath) return null;
  
  // Check if the URL is already a full URL (starts with http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the Supabase storage URL
  try {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(imagePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error generating image URL:', error);
    return null;
  }
};

/**
 * Component props for a product image with fallback
 */
export interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Default options for product images
 */
export const imageDefaults = {
  placeholderImage: '/placeholder.svg',
}; 