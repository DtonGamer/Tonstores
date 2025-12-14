// src/components/layout/Navbar.tsx

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, User, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isAuthenticated = !!user;
  const onDashboardRoute = pathname.startsWith("/dashboard");
  const onHomeRoute = pathname === "/";
  const onCheckoutRoute = pathname.startsWith("/checkout/") || pathname.includes("/checkout/");
  const onDashboardPages = pathname.startsWith("/dashboard") || 
                          pathname.startsWith("/catalog") || 
                          pathname.startsWith("/orders") || 
                          pathname.startsWith("/analytics") || 
                          pathname.startsWith("/settings");

  // Don't render the navbar when inside dashboard or on checkout routes
  // Also don't render when on any other dashboard-related pages where the sidebar is shown
  if (onDashboardRoute || onCheckoutRoute || onDashboardPages) {
    return null;
  }

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-Tonstores-darkblue to-Tonstores-green bg-clip-text text-transparent">Tonstores</span>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {!isAuthenticated && (
              <>
                <Link to="/" className="px-3 py-2 font-medium text-gray-700 hover:text-Tonstores-green transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/features" className="px-3 py-2 font-medium text-gray-700 hover:text-Tonstores-green transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Features
                </Link>
                <Link to="/pricing" className="px-3 py-2 font-medium text-gray-700 hover:text-Tonstores-green transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Pricing
                </Link>
                <Link to="/about" className="px-3 py-2 font-medium text-gray-700 hover:text-Tonstores-green transition-colors" onClick={() => setIsMenuOpen(false)}>
                  About
                </Link>
                <Link to="/contact" className="px-3 py-2 font-medium text-gray-700 hover:text-Tonstores-green transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </Link>
                <div className="ml-4 flex items-center space-x-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="border-gray-300 hover:border-Tonstores-green text-gray-700 hover:text-Tonstores-green">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="bg-Tonstores-green hover:bg-Tonstores-darkblue text-white">
                      Sign Up
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* If authenticated on home page, show only Dashboard */}
            {isAuthenticated && onHomeRoute && (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button className="bg-Tonstores-green hover:bg-Tonstores-darkblue text-white flex items-center space-x-2">
                  <User size={18} />
                  <span>Dashboard</span>
                </Button>
              </Link>
            )}

            {/* If authenticated but not on home page, show Dashboard */}
            {isAuthenticated && !onHomeRoute && (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="border-gray-300 text-Tonstores-darkblue hover:bg-gray-50">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-Tonstores-green focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg rounded-b-lg animate-fade-in">
          <div className="flex flex-col space-y-3 pb-3 border-b border-gray-200">
            {!isAuthenticated && (
              <>
                <Link to="/" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-Tonstores-green" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/features" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-Tonstores-green" onClick={() => setIsMenuOpen(false)}>
                  Features
                </Link>
                <Link to="/pricing" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-Tonstores-green" onClick={() => setIsMenuOpen(false)}>
                  Pricing
                </Link>
                <Link to="/about" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-Tonstores-green" onClick={() => setIsMenuOpen(false)}>
                  About
                </Link>
                <Link to="/contact" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-Tonstores-green" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </Link>
              </>
            )}

            {isAuthenticated && onHomeRoute && (
              <Link to="/dashboard" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-Tonstores-green" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            )}

            {isAuthenticated && !onHomeRoute && (
              <Link to="/dashboard" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-Tonstores-green" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            )}
          </div>
          
          {!isAuthenticated && (
            <div className="mt-4 flex flex-col space-y-3">
              <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center border-gray-300 text-gray-700">
                  Log In
                </Button>
              </Link>
              <Link to="/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full justify-center bg-Tonstores-green hover:bg-Tonstores-darkblue text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
