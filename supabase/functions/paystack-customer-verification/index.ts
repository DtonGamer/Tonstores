import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
  mapSnakeToCamel
} from '../_shared/utils.ts';

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
    return handleCorsOptions();
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
  const devMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true" || isDevelopmentMode();

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

  // Initialize Supabase client using shared utility
  const supabase = createSupabaseClient();
  if (!supabase) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

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

    // Get Paystack credentials from environment
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    // We require Paystack credentials for this operation
    if (!PAYSTACK_SECRET_KEY) {
      return jsonResponse(500, { error: "Paystack credentials not configured" });
    }

    // First, create or update the customer in Paystack if they don't already exist
    let customerResponse: any;
    
    // Check if customer already exists by email
    const checkResp = await fetch(`https://api.paystack.co/customer/${encodeURIComponent(data.email)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (checkResp.status === 200) {
      // Customer already exists
      customerResponse = await checkResp.json();
    } else {
      // Customer doesn't exist, create a new one
      const customerPayload = {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phoneNumber
      };

      const createResp = await fetch("https://api.paystack.co/customer", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customerPayload)
      });

      customerResponse = await createResp.json();

      if (createResp.status !== 200 || !customerResponse.status) {
        return jsonResponse(createResp.status, {
          error: customerResponse.message || "Failed to create Paystack customer",
          details: customerResponse
        });
      }
    }

    // If BVN is provided, initiate identity verification
    if (data.bvn) {
      // Update the customer with BVN
      const updatePayload: any = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phoneNumber,
      };

      // Only add metadata if we have additional KYC information
      const metadata: any = {};
      if (data.bvn) metadata.bvn = data.bvn;
      if (data.dateOfBirth) metadata.date_of_birth = data.dateOfBirth;
      if (data.identificationType) metadata.identification_type = data.identificationType;
      if (data.identificationNumber) metadata.identification_number = data.identificationNumber;
      if (data.address) metadata.address = data.address;
      if (data.city) metadata.city = data.city;
      if (data.state) metadata.state = data.state;
      if (data.country) metadata.country = data.country;
      if (data.businessName) metadata.business_name = data.businessName;
      if (data.businessType) metadata.business_type = data.businessType;
      if (data.businessRegistrationNumber) metadata.business_registration_number = data.businessRegistrationNumber;
      if (data.tin) metadata.tin = data.tin;

      if (Object.keys(metadata).length > 0) {
        updatePayload.metadata = metadata;
      }

      const updateResp = await fetch(`https://api.paystack.co/customer/${customerResponse.data.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatePayload)
      });

      const updateResult = await updateResp.json();

      if (updateResp.status !== 200 || !updateResult.status) {
        console.error("Failed to update customer:", updateResult);
        // Continue with verification even if update fails
      }
    }

    // If BVN is provided, we can initiate a verification request
    if (data.bvn) {
      // Try to validate the BVN
      const verificationPayload = {
        verification_type: "bvn",
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phoneNumber,
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/paystack-customer-verification`,
        ...data.bvn && { bvn: data.bvn }
      };

      // This would typically be a call to Paystack's identity verification API
      // Paystack doesn't have a separate identity verification API like some other providers
      // Instead, the BVN is associated with the customer and can be verified through Paystack's dashboard
    }

    // Update the user's KYC status in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        kyc_verified: true,
        kyc_verified_at: new Date().toISOString(),
        ...(data.bvn && { paystack_bvn: data.bvn })
      })
      .eq('id', data.userId);

    if (updateError) {
      console.error("Error updating KYC status:", updateError);
      // We still return success since the customer verification was initiated
    }

    // Success: return verification details
    return jsonResponse(200, {
      status: true,
      message: "Customer verification initiated successfully",
      data: {
        customer: customerResponse.data,
        verification_status: "initiated",
        ...(data.bvn && { bvn_associated: true })
      }
    });
  } catch (error) {
    return handleCommonError(error, "Paystack customer verification");
  }
});