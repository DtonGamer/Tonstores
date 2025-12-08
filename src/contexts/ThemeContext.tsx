import React, { createContext, useContext, useEffect, useState } from 'react';
import { addAuthStateListener, getCurrentSession } from "@/integrations/supabase/authManager";

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Get initial theme from localStorage or default to system
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('tonstores-theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        return savedTheme;
      }
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Function to set theme and save to localStorage
  const setTheme = (newTheme: Theme) => {
    // Force light theme only - disable dark mode
    setThemeState('light');
    localStorage.setItem('tonstores-theme', 'light');
  };

  // Check if user is authenticated
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const sessionResult = await getCurrentSession();
        if (mounted) {
          setIsAuthenticated(!!sessionResult.data.session);
        }

        // Subscribe to auth changes using the global auth manager
        const unsubscribe = addAuthStateListener(
          (event, session) => {
            if (mounted) {
              setIsAuthenticated(!!session);
            }
          }
        );

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error checking auth status:', error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Effect to handle system theme changes and apply theme to document
  useEffect(() => {
    const handleChange = () => {
      // Force light theme only - disable dark mode
      setResolvedTheme('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    };

    // Initial setup - always use light theme
    handleChange();

    // Never listen for system theme changes since we're forcing light mode
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 