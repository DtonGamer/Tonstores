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
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/badge";

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
  const { user, signOut, authInitialized } = useAuth();
  const { profile } = useProfile();
  const { subscription } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();

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
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="mobile-menu-button flex items-center justify-center p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle menu"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-tonstores-darkblue dark:text-white">TonStores</span>
            </Link>
            <ThemeToggle />
          </div>

          <Badge variant="outline" className="mx-4 mt-2 text-[0.6rem] px-1 py-0 border-amber-400 text-amber-500 font-medium self-start">
            Experimental Dark Mode
          </Badge>

          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1 mt-5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md hover:bg-tonstores-lightgray dark:hover:bg-gray-800 ${
                    location.pathname === item.href
                      ? "bg-tonstores-lightgray dark:bg-gray-800 text-tonstores-darkblue dark:text-white"
                      : "text-tonstores-darkgray dark:text-gray-300"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <Avatar className="inline-block h-9 w-9 rounded-full">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white">
                    {profile?.business_name || "My Business"}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-red-600 dark:text-red-400 flex items-center"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileNavOpen(false)}></div>

        <div className={`sidebar-content relative transform transition-transform duration-300 ease-in-out ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col w-72 max-w-[80%] h-full bg-white dark:bg-gray-900 overflow-y-auto`}>
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-tonstores-darkblue dark:text-white">TonStores</span>
            </Link>
            <ThemeToggle />
          </div>

          <Badge variant="outline" className="mx-4 mt-2 text-[0.6rem] px-1 py-0 border-amber-400 text-amber-500 font-medium self-start">
            Experimental Dark Mode
          </Badge>

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

          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <Avatar className="inline-block h-10 w-10 rounded-full">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white">
                    {profile?.business_name || "My Business"}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm text-red-600 dark:text-red-400 flex items-center"
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
    </>
  );
}
