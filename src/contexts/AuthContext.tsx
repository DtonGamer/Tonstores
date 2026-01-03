import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { Profile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  addAuthStateListener,
  getCurrentSession,
  refreshCurrentSession,
  signInWithEmailAndPassword,
  signUpWithEmailAndPassword,
  signOut as supabaseSignOut,
} from "@/integrations/supabase/authManager";
import { debugLog } from "@/utils/debug";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  profile: Profile | null;
  isAdmin: boolean;
  authInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, businessName: string, referralCode?: string) => Promise<void>;
  processReferralAfterSignup: (referralCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  
  // Use ref to track if profile has been fetched for current user
  const profileFetchedForUser = useRef<string | null>(null);

  // Stable fetchProfile function - no dependencies that change
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    // Check if we already fetched for this user
    if (profileFetchedForUser.current === userId) {
      debugLog("Skipping profile fetch - already fetched for this user");
      return profile;
    }

    debugLog("Fetching profile for user:", userId);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      debugLog("Profile fetched successfully");
      setProfile(data);
      setIsAdmin(data?.role === 'admin');
      profileFetchedForUser.current = userId; // Mark as fetched
      return data;
    } catch (error) {
      console.error("Exception when fetching profile:", error);
      return null;
    }
  };

  // Initialize auth state - RUNS ONCE
  useEffect(() => {
    let mounted = true;
    debugLog("🚀 Initializing auth state");

    const initAuth = async () => {
      try {
        const sessionResult = await getCurrentSession();

        if (!mounted) return;

        if (sessionResult.error) {
          console.error("Session error:", sessionResult.error);
          setAuthInitialized(true);
          setIsLoading(false);
          return;
        }

        const currentSession = sessionResult.data.session;
        
        if (currentSession) {
          debugLog("✅ Session found, refreshing...");
          
          // Try to refresh
          const refreshResult = await refreshCurrentSession();
          
          const finalSession = refreshResult.data?.session || currentSession;
          const finalUser = finalSession.user;

          if (mounted) {
            setSession(finalSession);
            setUser(finalUser);
            
            if (finalUser) {
              await fetchProfile(finalUser.id);
            }
            
            setAuthInitialized(true);
            setIsLoading(false);
            debugLog("✅ Auth initialized with user");
          }
        } else {
          debugLog("❌ No session found");
          if (mounted) {
            setAuthInitialized(true);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (mounted) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Set up auth listener
    const unsubscribe = addAuthStateListener(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!mounted) return;

        debugLog("🔄 Auth event:", event);

        setSession(newSession);
        const newUser = newSession?.user ?? null;
        setUser(newUser);

        // Only fetch profile on actual SIGNED_IN event (not INITIAL_SESSION or TOKEN_REFRESHED)
        if (newUser && event === "SIGNED_IN") {
          debugLog("👤 New sign-in detected, fetching profile");
          profileFetchedForUser.current = null; // Reset flag for new user
          await fetchProfile(newUser.id);
        } else if (!newUser) {
          debugLog("👋 User signed out, clearing profile");
          setProfile(null);
          setIsAdmin(false);
          profileFetchedForUser.current = null;
        } else {
          debugLog("ℹ️ Auth event doesn't require profile fetch:", event);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
      debugLog("🧹 Auth cleanup");
    };
  }, []); // ✅ Empty array - runs only once

  const processReferralAfterSignup = async (referralCode: string = '') => {
    if (!referralCode || !user) return;

    try {
      debugLog("Processing referral code:", referralCode);
      const { AffiliateService } = await import('@/services/AffiliateService');
      await AffiliateService.processReferralFromUrl(user.id, referralCode);
      debugLog("Referral processed successfully");
    } catch (error: any) {
      console.error("Referral processing error:", error);
      toast({
        title: "Referral Warning",
        description: error.message || "Unable to process referral code",
        variant: "destructive",
      });
    }
  };

  const contextValue = useMemo(() => ({
    user,
    session,
    isLoading,
    profile,
    isAdmin,
    authInitialized,
    signIn: async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const { error } = await signInWithEmailAndPassword(email, password);
        if (error) throw error;
        
        toast({ title: "Success", description: "Logged in successfully" });
      } catch (error: any) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    signUp: async (email: string, password: string, businessName: string, referralCode?: string) => {
      setIsLoading(true);
      try {
        const { error, data } = await signUpWithEmailAndPassword(
          email,
          password,
          businessName,
          'seller'
        );

        if (error) throw error;

        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account. You'll be redirected to the verification page.",
        });

        if (data.user) {
          await processReferralAfterSignup(referralCode);
        }
      } catch (error: any) {
        toast({
          title: "Registration Failed",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    processReferralAfterSignup,
    signOut: async () => {
      try {
        setIsLoading(true);
        await supabaseSignOut();
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setSession(null);
        profileFetchedForUser.current = null;
      } catch (error: any) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
  }), [user, session, isLoading, profile, isAdmin, authInitialized]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}