import { useEffect } from 'react';
import { 
  trackEvent, 
  trackPageView, 
  trackButtonClick, 
  trackFormSubmit, 
  trackPaymentEvent,
  trackProductEvent,
  trackAuthEvent,
  trackSubscriptionEvent,
  trackKYCEvent,
  trackError,
  EventType,
  EventData
} from '@/utils/eventTracker';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to provide event tracking functions
 */
export const useEventTracker = () => {
  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmit,
    trackPaymentEvent,
    trackProductEvent,
    trackAuthEvent,
    trackSubscriptionEvent,
    trackKYCEvent,
    trackError
  };
};

/**
 * Hook to automatically track page views
 * Add this to your main App component to track all route changes
 */
export const usePageViewTracker = () => {
  const location = useLocation();
  const { trackPageView } = useEventTracker();

  useEffect(() => {
    const pagePath = location.pathname + location.search;
    const pageTitle = typeof document !== 'undefined' ? document.title : '';
    
    trackPageView(pagePath, pageTitle).catch(error => {
      console.error('Failed to track page view:', error);
    });
  }, [location]);
};

/**
 * Hook to track events with additional context
 * @param component The component name to include in event data
 */
export const useComponentEventTracker = (component: string) => {
  const { trackEvent, trackButtonClick, trackFormSubmit, trackError } = useEventTracker();

  const trackComponentEvent = (eventType: EventType, data: EventData = {}) => {
    return trackEvent(eventType, { ...data, component });
  };

  const trackComponentButtonClick = (buttonName: string, additionalData?: EventData) => {
    return trackButtonClick(buttonName, component, additionalData);
  };

  const trackComponentFormSubmit = (formName: string, formData?: Record<string, any>) => {
    return trackFormSubmit(formName, formData, component);
  };

  const trackComponentError = (error: Error | string, operation?: string) => {
    return trackError(error, component, operation);
  };

  return {
    trackEvent: trackComponentEvent,
    trackButtonClick: trackComponentButtonClick,
    trackFormSubmit: trackComponentFormSubmit,
    trackError: trackComponentError,
    // Also return the original functions
    ...{ trackEvent, trackButtonClick, trackFormSubmit, trackError }
  };
};