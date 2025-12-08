import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart,
  Wallet,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SubscriptionDialog } from "../subscription/SubscriptionDialog";
import { usePricingPlans } from "@/hooks/usePricingPlans";

// Debug flag for logging
const DEBUG = false;

const debugLog = (...args: any[]) => {
  if (DEBUG) {
    // console.log("[SidebarNav]", ...args);
  }
};

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

export default function SidebarNav() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, signOut, authInitialized } = useAuth();
  const { profile } = useProfile();
  const { subscription } = useSubscription();
  const { data: plans } = usePricingPlans();
  const location = useLocation();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Update CSS variable for sidebar width on collapse/expand
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isSidebarCollapsed ? '5rem' : '16rem'
    );
  }, [isSidebarCollapsed]);

  // Find the next tier plan (if any)
  const currentPlanIndex = plans?.findIndex(plan =>
    plan.id === subscription?.plan_id
  ) ?? -1;

  const nextTierPlan = currentPlanIndex >= 0 && currentPlanIndex < (plans?.length ?? 0) - 1
    ? plans?.[currentPlanIndex + 1]
    : null;

  const handleUpgradeClick = () => {
    if (nextTierPlan) {
      setSelectedPlanId(nextTierPlan.id);
      setDialogOpen(true);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedPlanId(null);
  };

  const selectedPlan = plans?.find(plan => plan.id === selectedPlanId);

  // Determine if user has a business plan by checking if they have a subscription that is not 'Free'
  const isBusinessUser = subscription &&
                        subscription.pricing_plans &&
                        subscription.pricing_plans.name !== 'Free' &&
                        subscription.status === 'active';

  // Define navigation items, conditionally including Finances for business users only
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Catalogs",
      href: "/dashboard",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    ...(isBusinessUser ? [{
      name: "Finances",
      href: "/finances",
      icon: <Wallet className="h-5 w-5" />,
    }] : []),
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  debugLog("Rendering with profile:", !!profile, "authInitialized:", authInitialized);

  const getInitials = () => {
    if (!profile?.business_name) return "TS";
    const name = profile.business_name;
    return name.split(" ").map(part => part[0]).join("").toUpperCase().substring(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavClick = (href: string) => {
    debugLog("Navigation clicked:", href);
    setIsMobileNavOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileNavOpen && !target.closest('.sidebar-content') && !target.closest('.mobile-menu-button')) {
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileNavOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="mobile-menu-button flex items-center justify-center p-2.5 rounded-lg bg-tonstores-green text-white hover:bg-tonstores-darkblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tonstores-green shadow-lg"
          aria-label="Toggle menu"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} lg:flex-col lg:fixed lg:inset-y-0`}>
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <Link to="/" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              {!isSidebarCollapsed && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-tonstores-green flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-tonstores-green to-tonstores-darkblue bg-clip-text text-transparent">
                    TonStores
                  </span>
                </div>
              )}
              {isSidebarCollapsed && (
                <div className="w-8 h-8 rounded-lg bg-tonstores-green flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </div>

          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1 mt-5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md hover:bg-tonstores-lightgray ${
                    location.pathname === item.href
                      ? "bg-tonstores-lightgray text-tonstores-darkblue"
                      : "text-tonstores-darkgray"
                  }`}
                >
                  {item.icon}
                  {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div>

          {/* Upgrade button and user profile section */}
          <div className="flex-shrink-0 flex flex-col border-t border-gray-200 p-4 space-y-4">
            {/* Upgrade subscription button */}
            {!isSidebarCollapsed && (
              <Button
                onClick={handleUpgradeClick}
                className="w-full bg-tonstores-green hover:bg-tonstores-darkblue text-white flex items-center justify-center gap-2 py-5"
                disabled={!nextTierPlan}
              >
                <ArrowUpCircle size={18} />
                <span className="font-medium">Upgrade Subscription</span>
              </Button>
            )}

            {!isSidebarCollapsed && (
              <div className="flex items-center justify-center pt-2">
                <div className="flex items-center w-full">
                  <Avatar className="inline-block h-9 w-9 rounded-full">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
                      {profile?.business_name || "My Business"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-600 p-0 h-auto flex items-center"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Collapsed view - icons only */}
            {isSidebarCollapsed && (
              <div className="flex flex-col items-center space-y-3">
                <Button
                  onClick={handleUpgradeClick}
                  className="w-10 h-10 p-0 rounded-full bg-tonstores-green hover:bg-tonstores-darkblue text-white flex items-center justify-center"
                  disabled={!nextTierPlan}
                  title="Upgrade Subscription"
                >
                  <ArrowUpCircle size={16} />
                </Button>
                <div className="flex flex-col items-center">
                  <Avatar className="inline-block h-9 w-9 rounded-full">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-600 p-0 h-auto mt-1"
                    onClick={handleSignOut}
                    title="Sign out"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileNavOpen(false)}></div>

        <div className={`sidebar-content relative transform transition-transform duration-300 ease-in-out ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col w-72 max-w-[80%] h-full bg-white shadow-xl`}>
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-tonstores-green flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-tonstores-green to-tonstores-darkblue bg-clip-text text-transparent">
                  TonStores
                </span>
              </div>
            </Link>
          </div>

          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1 mt-5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-base font-medium rounded-md hover:bg-tonstores-lightgray dark:hover:bg-gray-800 ${
                    location.pathname === item.href
                      ? "bg-tonstores-lightgray dark:bg-gray-800 text-tonstores-darkblue dark:text-white"
                      : "text-tonstores-darkgray dark:text-gray-300"
                  }`}
                  onClick={() => handleNavClick(item.href)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Upgrade button and user profile section */}
          <div className="flex-shrink-0 flex flex-col border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            {/* Upgrade subscription button - Mobile */}
            <Button
              onClick={handleUpgradeClick}
              className="w-full bg-tonstores-green hover:bg-tonstores-darkblue text-white flex items-center justify-center gap-2 py-5"
              disabled={!nextTierPlan}
            >
              <ArrowUpCircle size={18} />
              <span className="font-medium">Upgrade Subscription</span>
            </Button>

            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center w-full">
                <Avatar className="inline-block h-10 w-10 rounded-full">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-white truncate">
                    {profile?.business_name || "My Business"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-600 dark:text-red-400 p-0 h-auto flex items-center"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Dialog */}
      {selectedPlan && (
        <SubscriptionDialog
          isOpen={dialogOpen}
          onClose={closeDialog}
          plan={selectedPlan}
          billingCycle={billingCycle}
        />
      )}
    </>
  );
}
