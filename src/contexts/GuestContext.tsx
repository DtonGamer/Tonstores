import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getGuestUserId, ensureSessionParams } from '@/utils/sessionParams';

type GuestContextType = {
  guestId: string | null;
  isInitialized: boolean;
};

const GuestContext = createContext<GuestContextType>({
  guestId: null,
  isInitialized: false,
});

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize guest ID on component mount
    const initializeGuest = async () => {
      try {
        // This will generate a guest ID if one doesn't exist
        const id = getGuestUserId();
        setGuestId(id);
        
        // Ensure session parameters are set
        await ensureSessionParams();
        
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
    <GuestContext.Provider value={{ guestId, isInitialized }}>
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