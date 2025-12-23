import { useState, useEffect } from "react";
import useAuth from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { ProfileBase } from "@/types/profile";
import { debugLog } from "@/utils/debug";

export type Role = 'user' | 'admin';

export type Profile = {
  id: string;
  business_name: string;
  avatar_url?: string;
  business_address?: string;
  phone_number?: string;
  business_description?: string;
  paystack_subaccount_code?: string;
  paystack_bvn?: string;
  paystack_kyc_status?: string;
  paystack_kyc_submitted_at?: string;
  paystack_percentage_charge?: number;
  kyc_verified?: boolean;
  kyc_verified_at?: string;
  email_support?: string;
  contact_email?: string;
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
  // ... rest of your ProfileUpdate type
};

export const ADMIN_USER_ID = "b16bfd66-7f65-4c1c-a98d-bca1a75d06a1";

let adminProfileCache: ProfileBase | null = null;

export const getAdminProfile = async (): Promise<ProfileBase | null> => {
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
  const { 
    user, 
    profile: authProfile, 
    isAdmin: authIsAdmin, 
    isLoading: authLoading,
    authInitialized 
  } = useAuth();
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  debugLog("useProfile - authLoading:", authLoading, "hasAuthProfile:", !!authProfile, "authInitialized:", authInitialized);

  // ✅ Simply use the auth profile - no additional fetching needed
  const profile = authProfile;
  const loading = authLoading;
  const isAdmin = authProfile?.role === 'admin' || authIsAdmin;

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
      
      debugLog("Profile updated successfully");
      // Profile will be updated via auth context
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
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      
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

  debugLog("useProfile returning - loading:", loading, "hasProfile:", !!profile);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    isUploading,
    uploadProgress,
    isAdmin,
  };
};