import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEventTracker } from '../../hooks/useEventTracker';

// Component to track page views - must be used within a router context
export const PageViewTracker: React.FC = () => {
  const location = useLocation();
  const { trackPageView } = useEventTracker();

  useEffect(() => {
    const pagePath = location.pathname + location.search;
    const pageTitle = typeof document !== 'undefined' ? document.title : '';

    trackPageView(pagePath, pageTitle).catch(error => {
      console.error('Failed to track page view:', error);
    });
  }, [location, trackPageView]);

  return null; // This component doesn't render anything
};