import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Helper function to return standardized JSON responses
const jsonResponse = (statusCode: number, body: any) => {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store"
    },
  });
};

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
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Verify the request has a valid apikey (checking anon key for public functions)
    const apikey = req.headers.get("apikey");
    const expectedAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!apikey || apikey !== expectedAnonKey) {
      return jsonResponse(401, { error: "Invalid API key" });
    }

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

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse(500, { error: "Supabase configuration is missing" });
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare the event record
    const eventRecord = {
      user_id: data.user_id || null,  // Use provided user_id or null
      session_id: data.session_id,
      event_type: data.event_type,
      event_data: data.event_data,
      source: data.source || 'frontend',
      // Include the guest ID in event data if available for analytics
      ...(guestIdFromHeader && { guest_id: guestIdFromHeader })
    };

    // Insert the event record
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

    return jsonResponse(200, {
      success: true,
      message: "Event recorded successfully"
    });
  } catch (error: any) {
    console.error("Error in event tracking function:", error);
    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});