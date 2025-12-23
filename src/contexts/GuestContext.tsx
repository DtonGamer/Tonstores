import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUserId, isAnonymousUser } from '@/utils/sessionHelpers';

type GuestContextType = {
  guestId: string | null;
  isInitialized: boolean;
  isAnonymous: boolean;
};

const GuestContext = createContext<GuestContextType>({
  guestId: null,
  isInitialized: false,
  isAnonymous: false,
});

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Initialize guest session on component mount
    const initializeGuest = async () => {
      try {
        // Get current user ID (could be anonymous or authenticated)
        const userId = await getCurrentUserId();
        setGuestId(userId);

        // Check if user is anonymous
        const anonymous = await isAnonymousUser();
        setIsAnonymous(anonymous);

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing guest session:', error);
        // Set initialized to true even on error to prevent infinite loading
        setIsInitialized(true);
      }
    };

    initializeGuest();
  }, []);

  return (
    <GuestContext.Provider value={{ guestId, isInitialized, isAnonymous }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}

export default useGuest;