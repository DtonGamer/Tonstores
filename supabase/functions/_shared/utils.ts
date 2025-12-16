import { createClient } from "npm:@supabase/supabase-js@^2.39.0";

/**
 * Creates a JSON response with CORS headers
 */
export const jsonResponse = (statusCode: number, body: any) => {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store"
    },
  });
};

/**
 * Handles CORS OPTIONS requests
 */
export const handleCorsOptions = () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
};

/**
 * Creates a Supabase client instance
 */
export const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Handles common error patterns with timeout support
 */
export const handleCommonError = (error: any, operationName: string) => {
  console.error(`Error in ${operationName}:`, error);
  if (error.name === "AbortError") {
    return jsonResponse(504, { error: "API request timed out" });
  }
  return jsonResponse(500, {
    error: error.message || "Internal server error"
  });
};

/**
 * Checks if we're in development mode
 */
export const isDevelopmentMode = () => {
  return Deno.env.get("ENV") === "development";
};

/**
 * Maps field names from snake_case to camelCase
 */
export const mapSnakeToCamel = (data: Record<string, any>) => {
  const mappedData = { ...data };
  for (const [key, value] of Object.entries(data)) {
    if (key.includes('_') && !key.includes('.')) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (!mappedData[camelKey]) {
        mappedData[camelKey] = value;
        delete mappedData[key];
      }
    }
  }
  return mappedData;
};