import { useState, useEffect } from "react";
import  useAuth  from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { ProfileBase } from "@/types/profile";

// Debug flag for logging
const DEBUG = false;

const debugLog = (...args: any[]) => {
  if (DEBUG) {
    // console.log("[useProfile]", ...args);
  }
};

export type Role = 'user' | 'admin';

export type Profile = {
  id: string;
  business_name: string;
  avatar_url?: string;
  business_address?: string;
  phone_number?: string;
  business_description?: string;
  monnify_api_key?: string;
  monnify_secret_key?: string;
  monnify_subaccount_code?: string;
  monnify_subaccount_id?: string;
  email_support?: string;
  whatsapp_support?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  facebook_handle?: string;
  tiktok_handle?: string;
  role: Role;
  created_at: string;
  updated_at: string;
};

type ProfileUpdate = {
  business_name?: string;
  avatar_url?: string;
  business_address?: string;
  phone_number?: string;
  business_description?: string;
  monnify_api_key?: string;
  monnify_secret_key?: string;
  monnify_subaccount_code?: string;
  monnify_subaccount_id?: string;
  email_support?: string;
  whatsapp_support?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  facebook_handle?: string;
  tiktok_handle?: string;
  is_affiliate?: boolean;
  affiliate_status?: 'active' | 'pending' | 'inactive';
  affiliate_commission_rate?: number;
  affiliate_total_earnings?: number;
  affiliate_total_referrals?: number;
  referral_code?: string;
};

// Admin user ID
export const ADMIN_USER_ID = "b16bfd66-7f65-4c1c-a98d-bca1a75d06a1";

// Cache for the admin profile
let adminProfileCache: ProfileBase | null = null;

// Function to get the admin profile
export const getAdminProfile = async (): Promise<ProfileBase | null> => {
  // Return cached profile if available
  if (adminProfileCache) return adminProfileCache;
  
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", ADMIN_USER_ID)
      .eq("role", "admin")
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching admin profile:", error);
      return null;
    }
    
    adminProfileCache = data;
    return data;
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return null;
  }
};

export const useProfile = () => {
  const { user, profile: authProfile, isAdmin: authIsAdmin, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileBase | null>(authProfile);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [profileFetchAttempted, setProfileFetchAttempted] = useState<boolean>(false);

  debugLog("Hook initialized, authLoading:", authLoading, "authProfile:", !!authProfile);

  // Update profile when authProfile changes
  useEffect(() => {
    debugLog("authProfile changed:", !!authProfile);
    if (authProfile) {
      setProfile(authProfile);
      setLoading(false);
    }
  }, [authProfile]);

  // Update loading state when authLoading changes
  useEffect(() => {
    debugLog("authLoading changed:", authLoading);
    // If auth is not loading and we have either a profile or have attempted to fetch one
    if (!authLoading && (profile || profileFetchAttempted)) {
      debugLog("Setting loading to false based on authLoading");
      setLoading(false);
    }
  }, [authLoading, profile, profileFetchAttempted]);

  // This effect will fetch profile only if authProfile is not available
  useEffect(() => {
    if (!user) {
      debugLog("No user, clearing profile");
      setProfile(null);
      setLoading(false);
      return;
    }

    if (authProfile) {
      debugLog("Using authProfile, skipping fetch");
      setLoading(false);
      return;
    }

    debugLog("Fetching profile for user:", user.id);
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          debugLog("Error fetching profile:", error);
          throw error;
        }
        
        debugLog("Profile fetched successfully:", data);
        setProfile(data);
      } catch (error: any) {
        console.error("Error loading profile:", error);
        debugLog("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. " + error.message,
          variant: "destructive",
        });
      } finally {
        setProfileFetchAttempted(true);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authProfile]);

  const isAdmin = profile?.role === 'admin' || authIsAdmin;

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) throw new Error("User not authenticated");
    
    debugLog("Updating profile for user:", user.id);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      debugLog("Profile updated successfully:", data);
      setProfile(data);
      return data;
    } catch (error: any) {
      debugLog("Error updating profile:", error);
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error("User not authenticated");
    if (!file) throw new Error("No file selected");

    debugLog("Uploading avatar for user:", user.id);
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          upsert: true,
        });
      
      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update the user profile with the new avatar URL
      await updateProfile({ avatar_url: publicUrl });
      
      // For now, simulate progress since onUploadProgress is not supported
      setUploadProgress(100); 
      
      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated successfully."
      });

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const finalLoading = loading || authLoading;
  debugLog("Final loading state:", finalLoading);

  return {
    profile,
    loading: finalLoading,
    updateProfile,
    uploadAvatar,
    isUploading,
    uploadProgress,
    isAdmin,
  };
};
