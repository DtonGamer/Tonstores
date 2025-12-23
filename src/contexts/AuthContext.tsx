import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
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
  signUp: (email: string, password: string, businessName: string) => Promise<void>;
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
  const [profileFetched, setProfileFetched] = useState<boolean>(false);

  // Fetch profile only once per user
  const fetchProfile = useCallback(async (userId: string) => {
    if (!userId || profileFetched) {
      debugLog("Skipping profile fetch - already fetched or no userId");
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
      setProfileFetched(true);
      return data;
    } catch (error) {
      console.error("Exception when fetching profile:", error);
      return null;
    }
  }, [profileFetched, profile]);

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
          setProfileFetched(false); // Reset flag for new user
          await fetchProfile(newUser.id);
        } else if (!newUser) {
          debugLog("👋 User signed out, clearing profile");
          setProfile(null);
          setIsAdmin(false);
          setProfileFetched(false);
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
  }, []); // ✅ Empty array - this should only run once

  const processReferralAfterSignup = useCallback(async (referralCode: string = '') => {
    // Your referral logic here
  }, [user]);

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
    signUp: async (email: string, password: string, businessName: string) => {
      // Your signup logic
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
        setProfileFetched(false);
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
  }), [user, session, isLoading, profile, isAdmin, authInitialized, processReferralAfterSignup]);

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