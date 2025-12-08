import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Breadcrumbs from "./Breadcrumbs";
import { Footer } from "./Footer";
import useAuth from "@/contexts/AuthContext";
import { Disclaimer } from "./Disclaimer";
import { ErrorBoundary } from "../layout/ErrorBoundary"; // <-- import it
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const DEBUG = false;
const debugLog = (...args: any[]) => {
  if (DEBUG) console.log("[DashboardLayout]", ...args);
};

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, profile, authInitialized, user } = useAuth();
  const [contentReady, setContentReady] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Check if we're on a checkout route
  const isCheckoutRoute = pathname.startsWith("/checkout/") || pathname.includes("/checkout/");

  // Direct session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        debugLog("Performing direct session check");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          debugLog("Session check error:", error);
          setSessionChecked(true);
          return;
        }
        
        if (!data.session) {
          debugLog("No session found, redirecting to login");
          navigate("/login");
          return;
        }
        
        debugLog("Session found directly");
        setSessionChecked(true);
      } catch (error) {
        debugLog("Session check exception:", error);
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, [navigate]);

  useEffect(() => {
    debugLog("Auth state:", { isLoading, hasProfile: !!profile, authInitialized, hasUser: !!user, sessionChecked });

    // If auth is initialized and we have a user, or if auth is no longer loading, we can show content
    if (authInitialized && (user || !isLoading) || sessionChecked) {
      debugLog("Content ready - auth loaded or user available or session checked");
      setContentReady(true);
      return;
    }

    // Set a shorter timeout to avoid long loading times
    const timer = setTimeout(() => {
      debugLog("Timeout reached, forcing content display");
      setContentReady(true);
    }, 800); // Reduced from 1000ms to 800ms

    return () => clearTimeout(timer);
  }, [isLoading, profile, authInitialized, user, sessionChecked]);

  // Show loading spinner only if content is not ready AND we're still loading auth
  if (!contentReady && isLoading && !sessionChecked) {
    debugLog("Showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tonstores-green"></div>
      </div>
    );
  }

  debugLog("Rendering dashboard content");
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {!isCheckoutRoute && <SidebarNav />}

        {/* Main content */}
        <div className={`${!isCheckoutRoute ? 'lg:pl-[var(--sidebar-width,16rem)]' : ''} pt-4 lg:pt-0 flex flex-col flex-grow`}>
          {!isCheckoutRoute && (
            <div className="px-4 sm:px-6 lg:px-8 pt-4">
              <Breadcrumbs />
            </div>
          )}
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        {!isCheckoutRoute && <Disclaimer />}
      </div>
    </ErrorBoundary>
  );
}
