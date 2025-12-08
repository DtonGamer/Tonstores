import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Helper function to return standardized JSON responses
const jsonResponse = (statusCode: number, body: any) => {
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

// Define interface for customer verification payload
interface CustomerVerificationPayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bvn?: string;
  dateOfBirth?: string; // Format: YYYY-MM-DD
  identificationType?: string; // e.g., "NATIONAL_ID", "PASSPORT", "DRIVERS_LICENSE"
  identificationNumber?: string;
  identificationExpiryDate?: string; // Format: YYYY-MM-DD
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  businessName?: string;
  businessType?: string;
  businessRegistrationNumber?: string;
  tin?: string; // Tax Identification Number
  dev_mode?: boolean;
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Parse JSON body
  let data: CustomerVerificationPayload;
  try {
    data = await req.json();
  } catch (err) {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  // Check for development mode
  const isDevelopmentMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true";

  // Map snake_case field names to camelCase if they exist
  if (data.user_id && !data.userId) {
    data.userId = data.user_id;
  }
  if (data.first_name && !data.firstName) {
    data.firstName = data.first_name;
  }
  if (data.last_name && !data.lastName) {
    data.lastName = data.last_name;
  }
  if (data.phone_number && !data.phoneNumber) {
    data.phoneNumber = data.phone_number;
  }
  if (data.business_name && !data.businessName) {
    data.businessName = data.business_name;
  }
  if (data.business_type && !data.businessType) {
    data.businessType = data.business_type;
  }
  if (data.business_registration_number && !data.businessRegistrationNumber) {
    data.businessRegistrationNumber = data.business_registration_number;
  }
  if (data.tax_id_number && !data.tin) {
    data.tin = data.tax_id_number;
  }

  // Handle development mode with test data
  if (isDevelopmentMode) {
    // Use provided data or defaults for testing
    const testUserId = data.userId || "test-user-123";
    
    // Create mock verification response
    return jsonResponse(200, {
      status: true,
      message: "Customer verification initiated (Development Mode)",
      dev_mode: true,
      data: {
        verificationReference: "VERIFICATION_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: "PENDING",
        userId: testUserId,
        customerInfo: {
          firstName: data.firstName || "Test",
          lastName: data.lastName || "User",
          email: data.email || "test@example.com",
          phoneNumber: data.phoneNumber || "+2348012345678",
          bvn: data.bvn,
          dateOfBirth: data.dateOfBirth,
          identificationType: data.identificationType,
          identificationNumber: data.identificationNumber,
          businessName: data.businessName,
          businessType: data.businessType
        }
      },
      request_data: data
    });
  }

  // Validate required fields
  if (!data.userId || !data.firstName || !data.lastName || !data.email || !data.phoneNumber) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["userId", "firstName", "lastName", "email", "phoneNumber"]
    });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // First, verify that the user exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, business_name, email')
      .eq('id', data.userId)
      .single();

    if (profileError || !profileData) {
      return jsonResponse(404, { 
        error: "User not found", 
        details: profileError?.message 
      });
    }

    // Get Monnify credentials from environment
    const MONNIFY_API_KEY = Deno.env.get("MONNIFY_API_KEY");
    const MONNIFY_SECRET_KEY = Deno.env.get("MONNIFY_SECRET_KEY");

    // We require Monnify credentials for this operation
    if (!MONNIFY_API_KEY || !MONNIFY_SECRET_KEY) {
      return jsonResponse(500, { error: "Monnify credentials not configured" });
    }

    // Prepare the payload for Monnify KYC verification
    // Using the reserved accounts endpoint as that seems to be the main KYC endpoint in Monnify
    const monnifyPayload = {
      customerName: `${data.firstName} ${data.lastName}`,
      customerEmail: data.email,
      customerPhoneNumber: data.phoneNumber,
      ...(data.bvn && { customerBvn: data.bvn }),
      // Additional KYC fields would go here based on Monnify's specific requirements
    };

    // Call Monnify API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const authString = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
    const base64Auth = btoa(authString);

    // For customer verification, Monnify uses reserved accounts endpoint (from documentation)
    const resp = await fetch(`https://api.monnify.com/api/v1/bank-transfer/reserved-accounts`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${base64Auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(monnifyPayload),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const result = await resp.json();

    if (resp.status !== 200 || !result.requestSuccessful) {
      // Log detailed error info
      console.error("Monnify API error:", {
        status: resp.status,
        statusText: resp.statusText,
        result
      });

      // Forward Monnify error message with detailed info
      return jsonResponse(resp.status, {
        error: result.responseMessage || "Monnify API error",
        details: result
      });
    }

    // If verification is successful, update the user's KYC status in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        kyc_verified: true,
        kyc_verified_at: new Date().toISOString()
      })
      .eq('id', data.userId);

    if (updateError) {
      console.error("Error updating KYC status:", updateError);
      // We still return success since the Monnify verification succeeded
    }

    // Success: return verification details
    return jsonResponse(200, {
      status: true,
      message: result.responseMessage || "Customer verification initiated successfully",
      data: result.responseBody
    });
  } catch (error: any) {
    console.error("Error in customer verification:", error);

    // Check for timeout error
    if (error.name === "AbortError") {
      return jsonResponse(504, { error: "API request timed out" });
    }

    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});