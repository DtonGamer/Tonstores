import { useEffect } from 'react';
import useAuth from '@/contexts/AuthContext';

/**
 * Custom hook to force light mode for logged-out users
 * This helps ensure public pages are always in light mode
 */
export function useForceLightMode() {
  const { user } = useAuth();
  
  useEffect(() => {
    // Function to apply light mode
    const applyLightMode = () => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.style.backgroundColor = 'white';
      document.body.style.color = '#333333';
      
      // Force all background elements to use light mode colors
      document.querySelectorAll('div, section, main').forEach((el) => {
        if (el instanceof HTMLElement) {
          if (el.classList.contains('bg-background')) {
            el.classList.remove('bg-background');
            el.classList.add('bg-white');
          }
          
          if (el.classList.contains('text-foreground')) {
            el.classList.remove('text-foreground');
            el.classList.add('text-Tonstores-darkblue');
          }
          
          if (el.classList.contains('text-muted-foreground')) {
            el.classList.remove('text-muted-foreground');
            el.classList.add('text-gray-600');
          }
        }
      });
    };
    
    // Apply light mode immediately and with a slight delay to ensure it overrides any theme changes
    if (!user) {
      applyLightMode();
      const timeoutId = setTimeout(applyLightMode, 50);
      // Reapply every second to ensure it stays in light mode (will only run when not logged in)
      const intervalId = setInterval(applyLightMode, 1000);
      
      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }
    
    return () => {
      // No cleanup needed if user is logged in
    };
  }, [user]);
}

export default useForceLightMode; 