import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React, { useEffect } from "react";
import Index from "./pages/public/Index";
import Dashboard from "./pages/Dashboard";
import CatalogBuilder from "./pages/CatalogBuilder";
import CatalogView from "./pages/CatalogView";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import OrderManagement from "./pages/OrderManagement";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Features from "./pages/public/Features";
import Pricing from "./pages/public/Pricing";
import OnboardingFlow from "./components/catalog/OnboardingFlow";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsOfService from "./pages/public/TermsOfService";
import HelpCenter from "./pages/public/HelpCenter";
import Testimonials from "./pages/public/Testimonials";
import Finances from "./pages/Finances";
import AuthForm from "./components/auth/AuthForm";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute, { PremiumRoute } from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Navbar from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Disclaimer } from "./components/layout/Disclaimer";
import useAuth from "./contexts/AuthContext";
import VerifyEmail from "./pages/auth/VerifyEmail";
import PasswordRecovery from "./pages/auth/PasswordRecovery";
import UpdatePassword from "./pages/auth/UpdatePassword";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { PageViewTracker } from "./components/analytics/PageViewTracker";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import AffiliateToolsPage from "./pages/AffiliateToolsPage";
import AffiliateTermsPage from "./pages/AffiliateTermsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
    },
  },
});

// Create route wrappers for protected routes using Dashboard Layout
const DashboardRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DashboardLayout>
      <PageViewTracker />
      {children}
    </DashboardLayout>
  </ProtectedRoute>
);

// Create a wrapper for public pages with layout
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  // If user is authenticated, don't show navbar and footer
  if (user) {
    return (
      <>
        <PageViewTracker />
        {children}
        <Disclaimer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageViewTracker />
      {children}
      <Footer />
      <Disclaimer />
    </>
  );
};

// Create a special layout for CatalogView without navbar for all users
const CatalogViewLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PageViewTracker />
      {children}
      <Disclaimer />
    </>
  );
};

// Create a layout for OrderSuccess page without navbar
const OrderSuccessLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PageViewTracker />
      {children}
      <Disclaimer />
    </>
  );
};

// Create a layout for OrderTracking page without navbar
const OrderTrackingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PageViewTracker />
      {children}
      <Disclaimer />
    </>
  );
};

// Layout for auth pages that need tracking
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PageViewTracker />
      {children}
    </>
  );
};

const App = () => {
  // Check for redirect after login
  useEffect(() => {
    const redirectPath = sessionStorage.getItem("redirectAfterLogin");
    if (redirectPath) {
      sessionStorage.removeItem("redirectAfterLogin");
      // We don't need to navigate here because ProtectedRoute will handle it
    }
  }, []);

  // Create router with createBrowserRouter
  const router = createBrowserRouter([
    {
      path: "/",
      element: <PublicLayout><Index /></PublicLayout>
    },
    {
      path: "/features",
      element: <PublicLayout><Features /></PublicLayout>
    },
    {
      path: "/pricing",
      element: <PublicLayout><Pricing /></PublicLayout>
    },
    {
      path: "/about",
      element: <PublicLayout><About /></PublicLayout>
    },
    {
      path: "/contact",
      element: <PublicLayout><Contact /></PublicLayout>
    },
    {
      path: "/privacy",
      element: <PublicLayout><PrivacyPolicy /></PublicLayout>
    },
    {
      path: "/terms",
      element: <PublicLayout><TermsOfService /></PublicLayout>
    },
    {
      path: "/help",
      element: <PublicLayout><HelpCenter /></PublicLayout>
    },
    {
      path: "/testimonials",
      element: <PublicLayout><Testimonials /></PublicLayout>
    },
    {
      path: "/dashboard",
      element: <DashboardRoute><Dashboard /></DashboardRoute>
    },
    {
      path: "/onboarding",
      element: <DashboardRoute><OnboardingFlow /></DashboardRoute>
    },
    {
      path: "/catalog/new",
      element: <DashboardRoute><CatalogBuilder /></DashboardRoute>
    },
    {
      path: "/catalog/:id/edit",
      element: <DashboardRoute><CatalogBuilder /></DashboardRoute>
    },
    {
      path: "/orders",
      element: <DashboardRoute><OrderManagement /></DashboardRoute>
    },
    {
      path: "/settings",
      element: <DashboardRoute><Settings /></DashboardRoute>
    },
    {
      path: "/analytics",
      element: <DashboardRoute><Analytics /></DashboardRoute>
    },
    {
      path: "/c/:slug",
      element: <CatalogViewLayout><CatalogView /></CatalogViewLayout>
    },
    {
      path: "/checkout/:slug",
      element: <PublicLayout><Checkout /></PublicLayout>
    },
    {
      path: "/order-success/:id",
      element: <OrderSuccessLayout><OrderSuccess /></OrderSuccessLayout>
    },
    {
      path: "/order-tracking/:id",
      element: <OrderTrackingLayout><OrderTracking /></OrderTrackingLayout>
    },
    {
      path: "/login",
      element: <AuthLayout><div className="min-h-screen bg-Tonstores-lightgray flex items-center justify-center p-4"><AuthForm type="login" /></div></AuthLayout>
    },
    {
      path: "/register",
      element: <AuthLayout><div className="min-h-screen bg-Tonstores-lightgray flex items-center justify-center p-4"><AuthForm type="register" /></div></AuthLayout>
    },
    {
      path: "/auth/verify",
      element: <AuthLayout><VerifyEmail /></AuthLayout>
    },
    {
      path: "/auth/recovery",
      element: <AuthLayout><PasswordRecovery /></AuthLayout>
    },
    {
      path: "/auth/update-password",
      element: <AuthLayout><UpdatePassword /></AuthLayout>
    },
    {
      path: "/finances",
      element: <DashboardRoute><PremiumRoute><Finances /></PremiumRoute></DashboardRoute>
    },
    {
      path: "/affiliate",
      element: <DashboardRoute><AffiliateDashboard /></DashboardRoute>
    },
    {
      path: "/affiliate/tools",
      element: <DashboardRoute><AffiliateToolsPage /></DashboardRoute>
    },
    {
      path: "/affiliate/terms",
      element: <DashboardRoute><AffiliateTermsPage /></DashboardRoute>
    },
    {
      path: "*",
      element: <NotFound />
    }
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary>
              <RouterProvider router={router} />
            </ErrorBoundary>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;