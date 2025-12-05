import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Set this to true to enable debug logging
const DEBUG = false;

// Debug logger function
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log("[ReconnectHandler]", ...args);
  }
};

// Track visibility changes
let wasHidden = false;
let lastVisibleTime = Date.now();
const INACTIVITY_THRESHOLD = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Initialize reconnection handler for Supabase
 * 
 * This sets up listeners for tab visibility changes and reconnects
 * to Supabase after a period of inactivity to prevent ERR_INSUFFICIENT_RESOURCES
 */
export const initReconnectHandler = () => {
  debugLog("Initializing reconnect handler");

  // Check if we're in a browser environment
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  // Handle visibility change
  document.addEventListener("visibilitychange", async () => {
    const isHidden = document.visibilityState === "hidden";
    
    if (isHidden) {
      debugLog("Tab is now hidden");
      wasHidden = true;
      lastVisibleTime = Date.now();
    } else {
      debugLog("Tab is now visible");
      
      // Only perform reconnection if the tab was previously hidden
      if (wasHidden) {
        const now = Date.now();
        const hiddenDuration = now - lastVisibleTime;
        
        debugLog(`Tab was hidden for ${hiddenDuration / 1000} seconds`);
        
        // If the tab was hidden for longer than the threshold, refresh connection
        if (hiddenDuration > INACTIVITY_THRESHOLD) {
          debugLog("Reconnecting after long inactivity period");
          try {
            // First attempt to refresh the auth session
            await refreshSession();
            
            // For pages with cached data, consider a soft refresh
            // This is a good compromise between full page reload and doing nothing
            toast({
              title: "Connection refreshed",
              description: "Your session has been refreshed after inactivity.",
              duration: 3000,
            });
          } catch (error) {
            console.error("Error reconnecting:", error);
            
            // If refresh fails, suggest a manual reload
            toast({
              title: "Connection issue detected",
              description: "Please refresh the page to ensure optimal performance.",
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      }
      
      wasHidden = false;
    }
  });

  // Also listen for online/offline events
  window.addEventListener("online", async () => {
    debugLog("Browser is now online");
    // When coming back online, also refresh the session
    try {
      await refreshSession();
      toast({
        title: "You're back online",
        description: "Your connection has been restored.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error reconnecting after coming online:", error);
    }
  });

  window.addEventListener("offline", () => {
    debugLog("Browser is now offline");
    toast({
      title: "You're offline",
      description: "Check your internet connection.",
      variant: "destructive",
      duration: 5000,
    });
  });
};

/**
 * Refresh the Supabase session
 */
export const refreshSession = async () => {
  try {
    debugLog("Refreshing Supabase session");
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      throw error;
    }
    
    debugLog("Session refreshed successfully:", !!data.session);
    return true;
  } catch (error) {
    debugLog("Error refreshing session:", error);
    throw error;
  }
};

/**
 * Reset the connection to Supabase
 * This is a more aggressive approach that can be used if regular refresh fails
 */
export const resetConnection = async () => {
  // For now just refresh the page as a last resort
  window.location.reload();
};