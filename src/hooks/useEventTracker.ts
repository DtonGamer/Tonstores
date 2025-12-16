import { useEffect } from 'react';
import useAuth from '@/contexts/AuthContext';
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
  eventTracker,
  EventType,
  EventData
} from '@/utils/eventTracker';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to provide event tracking functions
 */
export const useEventTracker = () => {
  const { session } = useAuth();
  const userId = session?.user?.id || null;

  // Create wrapped functions that pass the current user ID to singleton methods
  const wrappedTrackPageView = (pageUrl: string, pageTitle?: string) =>
    eventTracker.trackPageView(userId, pageUrl, pageTitle);

  const wrappedTrackButtonClick = (buttonName: string, component?: string, additionalData?: EventData) =>
    eventTracker.trackButtonClick(userId, buttonName, component, additionalData);

  const wrappedTrackFormSubmit = (formName: string, formData?: Record<string, any>, component?: string) =>
    eventTracker.trackFormSubmit(userId, formName, formData, component);

  const wrappedTrackPaymentEvent = (
    eventType: 'payment_initiated' | 'payment_completed' | 'payment_failed',
    orderId: string,
    amount?: number,
    paymentMethod?: string
  ) => eventTracker.trackPaymentEvent(userId, eventType, orderId, amount, paymentMethod);

  const wrappedTrackProductEvent = (
    eventType: 'product_viewed' | 'product_added_to_cart',
    productId: string,
    productName?: string,
    catalogId?: string
  ) => eventTracker.trackProductEvent(userId, eventType, productId, productName, catalogId);

  const wrappedTrackAuthEvent = (
    eventType: 'login' | 'logout' | 'signup' | 'password_recovery_requested' | 'password_updated',
    provider?: string
  ) => eventTracker.trackAuthEvent(userId, eventType, provider);

  const wrappedTrackSubscriptionEvent = (
    eventType: 'subscription_initiated' | 'subscription_completed',
    planId: string,
    amount?: number
  ) => eventTracker.trackSubscriptionEvent(userId, eventType, planId, amount);

  const wrappedTrackKYCEvent = (
    eventType: 'kyc_form_viewed' | 'kyc_submitted' | 'kyc_verified' | 'kyc_failed',
    additionalData?: EventData
  ) => eventTracker.trackKYCEvent(userId, eventType, additionalData);

  const wrappedTrackError = (
    error: Error | string,
    component?: string,
    operation?: string
  ) => eventTracker.trackError(userId, error, component, operation);

  return {
    // Maintain the original functions for backward compatibility
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
    // Plus the new singleton-based versions
    trackPageViewWithId: wrappedTrackPageView,
    trackButtonClickWithId: wrappedTrackButtonClick,
    trackFormSubmitWithId: wrappedTrackFormSubmit,
    trackPaymentEventWithId: wrappedTrackPaymentEvent,
    trackProductEventWithId: wrappedTrackProductEvent,
    trackAuthEventWithId: wrappedTrackAuthEvent,
    trackSubscriptionEventWithId: wrappedTrackSubscriptionEvent,
    trackKYCEventWithId: wrappedTrackKYCEvent,
    trackErrorWithId: wrappedTrackError,
    // Also provide access to the singleton instance
    eventTracker
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