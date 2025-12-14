import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Define common event types for type safety
export type EventType =
  | 'catalog_viewed'
  | 'product_viewed'
  | 'product_added_to_cart'
  | 'checkout_initiated'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'order_created'
  | 'order_completed'
  | 'subscription_initiated'
  | 'subscription_completed'
  | 'kyc_form_viewed'
  | 'kyc_submitted'
  | 'kyc_verified'
  | 'kyc_failed'
  | 'subaccount_created'
  | 'profile_updated'
  | 'login'
  | 'logout'
  | 'signup'
  | 'password_recovery_requested'
  | 'password_updated'
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'error_occurred'
  | string; // Allow custom event types

// Define the structure for event data
export interface EventData {
  [key: string]: any;
  page?: string;
  component?: string;
  action?: string;
  details?: string;
  metadata?: Record<string, any>;
}

// Use the Supabase-generated type for the events table
export type EventRecord = Database['public']['Tables']['events']['Insert'];

// Store session ID in sessionStorage to track user sessions
const getSessionId = (): string => {
  if (typeof window === 'undefined') return ''; // For SSR
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    // Generate a new session ID (simple implementation - you might want to use UUID)
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Get current user ID if available
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};

// Get guest ID if no user session
const getGuestId = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('Tonstores-guest-id') || '';
};

class EventTracker {
  private static instance: EventTracker;
  private session_id: string;

  private constructor() {
    // Generate a unique session ID for grouping related events
    this.session_id = this.generateSessionId();
  }

  public static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  public async trackEvent(event: Omit<EventRecord, 'id' | 'created_at'>): Promise<boolean> {
    try {
      // Add session ID if not provided
      if (!event.session_id) {
        event.session_id = this.session_id;
      }

      // Add source if not provided
      if (!event.source) {
        event.source = 'frontend';
      }

      // Insert the event into the database
      // Ensure required fields are present
      const eventToInsert: EventRecord = {
        ...event,
        user_id: event.user_id || null, // Allow null user_id for system events
      };

      const { error } = await supabase
        .from('events')
        .insert([eventToInsert]);

      if (error) {
        console.error('Error tracking event:', error);
        return false;
      } else {
        console.log('Event tracked successfully:', event.event_type);
        return true;
      }
    } catch (err) {
      console.error('Error in trackEvent:', err);
      return false;
    }
  }

  // Convenience method for tracking workflow executions
  public async trackWorkflowExecution(
    userId: string,
    workflowType: 'engagement' | 'user_tracking' | 'metrics_update' | 'github_content_generation',
    success: boolean,
    extraData?: {
      workflow_id?: string;
      duration_ms?: number;
      error_message?: string;
      steps_count?: number;
    }
  ): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'workflow_executed',
      event_data: {
        workflow_type: workflowType,
        success,
        ...(extraData || {}),
      },
    });
  }

  // Convenience method for tracking page view events
  public async trackPageView(userId: string | null, pageUrl: string, pageTitle?: string): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'page_view',
      event_data: {
        page: pageUrl,
        title: pageTitle,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        viewport: typeof window !== 'undefined'
          ? { width: window.innerWidth, height: window.innerHeight }
          : undefined
      },
    });
  }

  // Convenience method for tracking button click events
  public async trackButtonClick(userId: string | null, buttonName: string, component?: string, additionalData?: EventData): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'button_click',
      event_data: {
        component,
        button: buttonName,
        ...additionalData
      },
    });
  }

  // Convenience method for tracking form submission events
  public async trackFormSubmit(userId: string | null, formName: string, formData?: Record<string, any>, component?: string): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'form_submit',
      event_data: {
        component,
        form: formName,
        submitted_data: formData ? Object.keys(formData) : undefined // Only track keys, not values for privacy
      },
    });
  }

  // Convenience method for tracking product-related events
  public async trackProductEvent(
    userId: string | null,
    eventType: 'product_viewed' | 'product_added_to_cart',
    productId: string,
    productName?: string,
    catalogId?: string
  ): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: eventType,
      event_data: {
        product_id: productId,
        product_name: productName,
        catalog_id: catalogId
      },
    });
  }

  // Convenience method for tracking payment events
  public async trackPaymentEvent(
    userId: string | null,
    eventType: 'payment_initiated' | 'payment_completed' | 'payment_failed',
    orderId: string,
    amount?: number,
    paymentMethod?: string
  ): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: eventType,
      event_data: {
        order_id: orderId,
        amount,
        payment_method: paymentMethod
      },
    });
  }

  // Convenience method for tracking user authentication events
  public async trackAuthEvent(
    userId: string | null,
    eventType: 'login' | 'logout' | 'signup' | 'password_recovery_requested' | 'password_updated',
    provider?: string
  ): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: eventType,
      event_data: {
        provider
      },
    });
  }

  // Convenience method for tracking subscription events
  public async trackSubscriptionEvent(
    userId: string | null,
    eventType: 'subscription_initiated' | 'subscription_completed',
    planId: string,
    amount?: number
  ): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: eventType,
      event_data: {
        plan_id: planId,
        amount
      },
    });
  }

  // Convenience method for tracking KYC events
  public async trackKYCEvent(
    userId: string | null,
    eventType: 'kyc_form_viewed' | 'kyc_submitted' | 'kyc_verified' | 'kyc_failed',
    additionalData?: EventData
  ): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: eventType,
      event_data: {
        ...additionalData
      },
    });
  }

  // Convenience method for tracking error events
  public async trackError(
    userId: string | null,
    error: Error | string,
    component?: string,
    operation?: string
  ): Promise<boolean> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' && 'stack' in error ? (error as Error).stack : undefined;

    return this.trackEvent({
      user_id: userId,
      event_type: 'error_occurred',
      event_data: {
        component,
        operation,
        error_message: errorMessage,
        error_stack: errorStack?.substring(0, 500) // Limit stack trace length
      },
    });
  }
}

// Create and export a singleton instance
export const eventTracker = EventTracker.getInstance();

/**
 * Track an event in the system
 * @param eventType The type of event being tracked
 * @param eventData Additional data about the event
 * @param source Where the event originated (default: 'frontend')
 */
export const trackEvent = async (
  eventType: EventType,
  eventData: EventData = {},
  source: 'frontend' | 'backend' | 'system' = 'frontend'
): Promise<boolean> => {
  try {
    // Skip event tracking if in development mode and not explicitly enabled
    if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_ENABLE_EVENT_TRACKING) {
      console.log(`Event tracking disabled in development: ${eventType}`, eventData);
      return true;
    }

    const userId = await getCurrentUserId();
    const sessionId = getSessionId();
    const guestId = getGuestId();

    // Prepare the event record
    // For authenticated users, track with their user_id
    // For unauthenticated users, we can still track events but with user_id as NULL
    const eventToInsert: EventRecord = {
      user_id: userId, // Will be null for unauthenticated users
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData,
      source,
      // guest_id: guestId || null
    };

    // Insert the event directly into the database using Supabase client
    const { error } = await supabase
      .from('events')
      .insert([eventToInsert]);

    if (error) {
      console.error('Error tracking event:', error);
      return false;
    } else {
      console.log('Event tracked successfully:', eventType, eventToInsert);
      return true;
    }
  } catch (error) {
    console.error('Error in trackEvent:', error);
    // Don't fail the entire operation if tracking fails, just log the error
    // This prevents tracking issues from affecting core functionality
    return true;
  }
};

/**
 * Track a page view event
 * @param pageUrl The URL of the page being viewed
 * @param pageTitle Optional page title
 */
export const trackPageView = async (pageUrl: string, pageTitle?: string): Promise<boolean> => {
  return trackEvent('page_view', {
    page: pageUrl,
    title: pageTitle,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    viewport: typeof window !== 'undefined' 
      ? { width: window.innerWidth, height: window.innerHeight } 
      : undefined
  });
};

/**
 * Track a button click event
 * @param buttonName Name or ID of the button
 * @param component Component where button is located
 * @param additionalData Any additional data to track
 */
export const trackButtonClick = async (
  buttonName: string, 
  component?: string, 
  additionalData?: EventData
): Promise<boolean> => {
  return trackEvent('button_click', {
    component,
    button: buttonName,
    ...additionalData
  });
};

/**
 * Track a form submission event
 * @param formName Name of the form
 * @param formData The data being submitted
 * @param component Component where form is located
 */
export const trackFormSubmit = async (
  formName: string,
  formData?: Record<string, any>,
  component?: string
): Promise<boolean> => {
  return trackEvent('form_submit', {
    component,
    form: formName,
    submitted_data: formData ? Object.keys(formData) : undefined // Only track keys, not values for privacy
  });
};

/**
 * Track a checkout or payment event
 * @param eventType Specific payment event type
 * @param orderId Associated order ID
 * @param amount Transaction amount
 * @param paymentMethod Payment method used
 */
export const trackPaymentEvent = async (
  eventType: 'payment_initiated' | 'payment_completed' | 'payment_failed',
  orderId: string,
  amount?: number,
  paymentMethod?: string
): Promise<boolean> => {
  return trackEvent(eventType, {
    order_id: orderId,
    amount,
    payment_method: paymentMethod
  });
};

/**
 * Track a product-related event
 * @param eventType Product event type
 * @param productId ID of the product
 * @param productName Name of the product
 * @param catalogId ID of the catalog containing the product
 */
export const trackProductEvent = async (
  eventType: 'product_viewed' | 'product_added_to_cart',
  productId: string,
  productName?: string,
  catalogId?: string
): Promise<boolean> => {
  return trackEvent(eventType, {
    product_id: productId,
    product_name: productName,
    catalog_id: catalogId
  });
};

/**
 * Track a user authentication event
 * @param eventType Authentication event type
 * @param provider Auth provider used (if applicable)
 */
export const trackAuthEvent = async (
  eventType: 'login' | 'logout' | 'signup' | 'password_recovery_requested' | 'password_updated',
  provider?: string
): Promise<boolean> => {
  return trackEvent(eventType, {
    provider
  });
};

/**
 * Track a subscription event
 * @param eventType Subscription event type
 * @param planId ID of the subscription plan
 * @param amount Subscription amount
 */
export const trackSubscriptionEvent = async (
  eventType: 'subscription_initiated' | 'subscription_completed',
  planId: string,
  amount?: number
): Promise<boolean> => {
  return trackEvent(eventType, {
    plan_id: planId,
    amount
  });
};

/**
 * Track a KYC (Know Your Customer) event
 * @param eventType KYC event type
 */
export const trackKYCEvent = async (
  eventType: 'kyc_form_viewed' | 'kyc_submitted' | 'kyc_verified' | 'kyc_failed',
  additionalData?: EventData
): Promise<boolean> => {
  return trackEvent(eventType, {
    ...additionalData
  });
};

/**
 * Track an error event
 * @param error The error object or message
 * @param component Component where error occurred
 * @param operation Operation that caused the error
 */
export const trackError = async (
  error: Error | string,
  component?: string,
  operation?: string
): Promise<boolean> => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && 'stack' in error ? (error as Error).stack : undefined;

  return trackEvent('error_occurred', {
    component,
    operation,
    error_message: errorMessage,
    error_stack: errorStack?.substring(0, 500) // Limit stack trace length
  });
};