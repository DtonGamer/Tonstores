import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { Profile } from "@/hooks/useProfile";
import { resendService } from "@/services/resendService";
import { emailService } from "@/services/emailService";
import { verifyDatabaseSchema } from "@/integrations/supabase/schema";
import {
  addAuthStateListener,
  getCurrentSession,
  refreshCurrentSession,
  signInWithEmailAndPassword,
  signUpWithEmailAndPassword,
  signOut as supabaseSignOut,
  getCurrentUser
} from "@/integrations/supabase/authManager";
import { trackAuthEvent, trackError } from "@/utils/eventTracker";

// Debug flag - set to true to enable detailed logging
const DEBUG = false;

// Debug logger function
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    // console.log("[AuthContext]", ...args);
  }
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  profile: Profile | null;
  isAdmin: boolean;
  authInitialized: boolean;
  signIn: (email: string, password: string, captchaToken?: string | null) => Promise<void>;
  signUp: (email: string, password: string, businessName: string, captchaToken?: string | null) => Promise<void>;
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

  // Fetch the user's profile
  const fetchProfile = async (userId: string) => {
    debugLog("Fetching profile for user:", userId);
    if (!userId) {
      debugLog("No userId provided to fetchProfile");
      return null;
    }

    try {
      // Use the shared supabase client instance
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        debugLog("Error fetching profile:", error);
        return null;
      }

      debugLog("Profile fetched successfully:", data);
      setProfile(data);
      setIsAdmin(data?.role === 'admin');
      return data;
    } catch (error) {
      console.error("Exception when fetching profile:", error);
      debugLog("Exception when fetching profile:", error);
      return null;
    }
  };

  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true;
    debugLog("Setting up auth state listener");

    const initAuth = async () => {
      try {
        debugLog("Checking for existing session");

        const sessionResult = await getCurrentSession();

        if (sessionResult.error) {
          console.error("Error getting session:", sessionResult.error);
          debugLog("Error getting session:", sessionResult.error);
          if (mounted) {
            setAuthInitialized(true);
            setIsLoading(false);
          }
          return;
        }

        if (!mounted) return;

        debugLog("Got session result:", !!sessionResult.data.session);

        // If we have a session, try to refresh it
        if (sessionResult.data.session) {
          debugLog("Refreshing session token");
          try {
            const refreshResult = await refreshCurrentSession();

            if (refreshResult.error) {
              console.error("Error refreshing session:", refreshResult.error);
              debugLog("Error refreshing session:", refreshResult.error);
              // Continue with the existing session
            } else if (refreshResult.data.session) {
              debugLog("Session refreshed successfully");
              setSession(refreshResult.data.session);
              setUser(refreshResult.data.session.user);

              if (refreshResult.data.session.user) {
                await fetchProfile(refreshResult.data.session.user.id);
              }

              if (mounted) {
                setAuthInitialized(true);
                setIsLoading(false);
              }
              return;
            }
          } catch (refreshError) {
            console.error("Exception refreshing session:", refreshError);
            debugLog("Exception refreshing session:", refreshError);
            // Continue with the existing session
          }
        }

        // Use the original session if refresh failed or wasn't needed
        setSession(sessionResult.data.session);
        const currentUser = sessionResult.data.session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          debugLog("User found from session, fetching profile");
          await fetchProfile(currentUser.id);
        } else {
          debugLog("No user from session");
        }

        if (mounted) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
        debugLog("Error in auth initialization:", error);
        if (mounted) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Set up auth state listener using the global manager
    const unsubscribe = addAuthStateListener(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        debugLog("Auth state changed. Event:", event, "Session present:", !!session);

        // Update session and user state
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          debugLog("User authenticated, fetching profile");
          try {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              // Retry profile fetch with exponential backoff
              let retries = 0;
              const fetchWithRetry = async () => {
                try {
                  await fetchProfile(currentUser.id);
                  setIsLoading(false);
                } catch (error) {
                  if (retries < 3) {
                    retries++;
                    setTimeout(fetchWithRetry, 1000 * Math.pow(2, retries));
                  } else {
                    setIsLoading(false);
                  }
                }
              };
              fetchWithRetry();
            } else {
              await fetchProfile(currentUser.id);
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Failed to fetch profile:", error);
            setIsLoading(false);
          }
        } else {
          debugLog("No user, clearing profile and admin status");
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      debugLog("Cleaning up auth subscription");
      unsubscribe();
    };
  }, []);

  // Check database schema
  useEffect(() => {
    const checkSchema = async () => {
      const missingItems = await verifyDatabaseSchema();

      if (missingItems.length > 0) {
        console.error("Database schema issues detected:", missingItems);
        toast({
          title: "Database Configuration Issue",
          description: "There might be issues with your database setup. Check the console for details.",
          variant: "destructive",
        });
      }
    };

    checkSchema();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    isLoading,
    profile,
    isAdmin,
    authInitialized,
    signIn: async (email: string, password: string, captchaToken: string | null = null) => {
      debugLog("Starting sign in process for email:", email);
      try {
        setIsLoading(true);

        // Validate inputs before sending to Supabase
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        if (!captchaToken) {
          throw new Error("Security verification is required");
        }

        // Log the authentication attempt (without sensitive data)
        debugLog("Attempting authentication with Supabase", { email, hasCaptcha: !!captchaToken });

        const { error, data } = await signInWithEmailAndPassword(email, password, captchaToken);

        if (error) {
          debugLog("Authentication error details:", error);

          // Handle specific error cases
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password");
          } else if (error.message.includes("Email not confirmed")) {
            throw new Error("Please verify your email address before logging in");
          } else if (error.message.includes("captcha") || error.message.includes("CAPTCHA") || error.message.includes("invalid-input-response")) {
            // Security verification error handling
            throw new Error("Security verification failed. Please try again");
          } else {
            throw error;
          }
        }

        debugLog("Sign in successful. User:", data.user?.id);
        toast({ title: "Success", description: "You've been successfully logged in" });

        // Track successful login
        trackAuthEvent('login', 'email').catch(console.error);
      } catch (error: any) {
        debugLog("Sign in error:", error);
        trackError(error, 'AuthContext', 'signIn').catch(console.error);

        toast({
          title: "Login failed",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
        throw error; // Re-throw to let the form component handle it
      } finally {
        setIsLoading(false);
      }
    },
    signUp: async (email: string, password: string, businessName: string, captchaToken: string | null = null) => {
      debugLog("Starting sign up process for email:", email);
      try {
        setIsLoading(true);

        // Validate inputs before sending to Supabase
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        if (!businessName) {
          throw new Error("Business name is required");
        }

        if (!captchaToken) {
          throw new Error("Security verification is required");
        }

        // Log the signup attempt (without sensitive data)
        debugLog("Attempting signup with Supabase", { email, businessName: businessName, hasCaptcha: !!captchaToken });

        // Create the user - the database trigger will handle profile creation
        const { error, data } = await signUpWithEmailAndPassword(email, password, businessName, captchaToken);

        if (error) {
          debugLog("Signup error details:", error);

          // Handle specific error cases
          if (error.message.includes("captcha") || error.message.includes("CAPTCHA") || error.message.includes("invalid-input-response")) {
            throw new Error("Security verification failed. Please refresh and try again");
          } else if (error.message.includes("User already registered")) {
            throw new Error("This email is already registered. Please use a different email or try logging in");
          } else {
            throw error;
          }
        }

        // If user was created successfully
        if (data.user) {
          debugLog("User created successfully:", data.user.id);

          // Track successful signup
          trackAuthEvent('signup', 'email').catch(console.error);

          // Send welcome email
          try {
            if (data.user.email) {
              await emailService.sendWelcomeEmail(data.user.email, businessName);
            }
          } catch (emailError) {
            // Don't fail the signup if email fails
            console.error("Failed to send welcome email:", emailError);
          }

          // Automatically sign in the user after registration
          if (data.session) {
            toast({
              title: "Account created successfully!",
              description: "Welcome to TonStores Hub",
            });

            // Navigate to dashboard
            window.location.href = "/dashboard";
          } else {
            // If no session, try to sign in manually
            try {
              const { error: signInError } = await signInWithEmailAndPassword(email, password);

              if (!signInError) {
                toast({
                  title: "Account created successfully!",
                  description: "Welcome to TonStores Hub",
                });

                // Navigate to dashboard
                window.location.href = "/dashboard";
              } else {
                toast({
                  title: "Account created!",
                  description: "Please log in with your credentials.",
                });

                // Navigate to login page
                window.location.href = "/login";
              }
            } catch (signInError) {
              toast({
                title: "Account created!",
                description: "Please log in with your credentials.",
              });

              // Navigate to login page
              window.location.href = "/login";
            }
          }
        }
      } catch (error: any) {
        debugLog("Sign up error:", error);
        trackError(error, 'AuthContext', 'signUp').catch(console.error);

        toast({
          title: "Registration failed",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
        throw error; // Re-throw to let the form component handle it
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
      debugLog("Signing out user");
      try {
        setIsLoading(true);
        const { error } = await supabaseSignOut();
        if (error) throw error;

        // Clear user and profile state
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setSession(null);

        // Reset the auth initialization state for next login
        const { resetAuthInit } = await import('@/utils/supabaseHelpers');
        resetAuthInit();

        debugLog("Sign out successful");
        trackAuthEvent('logout', 'manual').catch(console.error);
      } catch (error: any) {
        debugLog("Sign out error:", error);
        trackError(error, 'AuthContext', 'signOut').catch(console.error);

        toast({
          title: "Sign out failed",
          description: error.message || "An unexpected error occurred",
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