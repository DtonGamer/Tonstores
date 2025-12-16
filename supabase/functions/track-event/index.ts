import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
  mapSnakeToCamel
} from '../_shared/utils.ts';

interface TrackEventPayload {
  event_type: string;
  event_data: any;
  source?: string;
  user_id?: string;
  session_id?: string;
}

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma, expires",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store"
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = req.headers.get("apikey");
    const expectedAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    console.log("DEBUG - Auth check:", {
      hasAuthHeader: !!authHeader,
      hasApiKeyHeader: !!apiKeyHeader,
      expectedAnonKey: !!expectedAnonKey,
      apiKeyMatches: expectedAnonKey && apiKeyHeader === expectedAnonKey,
      authHeaderValue: authHeader ? "PRESENT" : "MISSING", // Only log presence, not value
      apiKeyHeaderValue: apiKeyHeader ? "PRESENT" : "MISSING" // Only log presence, not value
    });

    // For event tracking, allow if EITHER condition is true:
    // 1. Has valid Bearer token (logged in user) - Authorization header should be present
    // 2. Has valid anon key (public access) - apikey header should match expected value
    // 3. In some cases, we might want to allow tracking even without authentication for
    //    basic usage analytics, but that's a security decision to make carefully
    const hasValidAuth = !!authHeader || (expectedAnonKey && apiKeyHeader && apiKeyHeader === expectedAnonKey);

    if (!hasValidAuth) {
      console.error("Auth check failed:", {
        hasAuthHeader: !!authHeader,
        hasApiKeyHeader: !!apiKeyHeader,
        expectedAnonKey: !!expectedAnonKey,
        apiKeyMatches: expectedAnonKey && apiKeyHeader === expectedAnonKey,
        actualApiKey: apiKeyHeader ? "PRESENT" : "MISSING",
        expectedAnonKeyPresent: !!expectedAnonKey
      });
      return jsonResponse(401, {
        error: "Missing authorization header",
        details: {
          hasAuthHeader: !!authHeader,
          hasValidApiKey: expectedAnonKey && apiKeyHeader === expectedAnonKey,
          expectedAnonKeyPresent: !!expectedAnonKey
        }
      });
    }

    // ... rest of your code
    // Only allow POST
    if (req.method !== "POST") {
      return jsonResponse(405, { error: "Method Not Allowed" });
    }

    // Parse JSON body
    let data: TrackEventPayload;
    try {
      data = await req.json();
    } catch (err) {
      return jsonResponse(400, { error: "Invalid JSON body" });
    }

    // Check for development mode
    const isDevelopmentMode = data.source === "development" || Deno.env.get("DEV_MODE") === "true";

    if (isDevelopmentMode) {
      console.log("Event tracking in development mode:", data);
      return jsonResponse(200, {
        success: true,
        message: "Event recorded in development mode",
        dev_mode: true
      });
    }

    // Get custom guest ID from headers (similar to your guest session system)
    const guestIdFromHeader = req.headers.get("X-Guest-ID");

    // Initialize Supabase client with service role key to bypass RLS using shared utility
    const supabase = createSupabaseClient();
    if (!supabase) {
      return jsonResponse(500, { error: "Supabase configuration is missing" });
    }

    // Prepare the event record with guest_id column
    const eventRecord = {
      user_id: data.user_id || null,  // Use provided user_id or null
      session_id: data.session_id,
      event_type: data.event_type,
      event_data: data.event_data,
      source: data.source || 'frontend',
      // Include the guest ID if available for analytics
      ...(guestIdFromHeader && { guest_id: guestIdFromHeader })
    };

    // Insert the event record with the guest_id column
    const { error } = await supabase
      .from('events')
      .insert([eventRecord]);

    if (error) {
      console.error("Error inserting event:", error);
      return jsonResponse(500, {
        error: "Failed to record event",
        details: error.message
      });
    }

    console.log("Event recorded successfully:", {
      eventType: data.event_type,
      hasUserId: !!data.user_id,
      hasGuestId: !!guestIdFromHeader,
      sessionId: data.session_id
    });

    return jsonResponse(200, {
      success: true,
      message: "Event recorded successfully"
    });
  } catch (error) {
    return handleCommonError(error, "Event tracking");
  }
});