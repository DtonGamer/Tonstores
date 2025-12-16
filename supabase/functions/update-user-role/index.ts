// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase_functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
  mapSnakeToCamel
} from '../_shared/utils.ts';

type Role = 'user' | 'admin';

interface UpdateRoleRequest {
  target_user_id: string;
  new_role: Role;
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  // Parse request body to check for dev_mode
  let requestData;
  try {
    requestData = await req.json();
  } catch (e) {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  // Check for development mode
  const isDevelopmentMode = requestData.dev_mode === true || Deno.env.get("DEV_MODE") === "true";

  // Handle development mode
  if (isDevelopmentMode) {
    const { target_user_id, new_role } = requestData as UpdateRoleRequest;

    // Validate inputs
    if (!target_user_id || !new_role) {
      return jsonResponse(400, { error: 'Missing required fields' });
    }

    // Verify if role is valid
    if (new_role !== 'user' && new_role !== 'admin') {
      return jsonResponse(400, { error: 'Invalid role specified' });
    }

    // Return mock success response
    return new Response(
      JSON.stringify({
        message: 'User role updated successfully (Development Mode)',
        dev_mode: true,
        user: {
          id: target_user_id,
          role: new_role
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Pragma': 'no-cache'
        },
        status: 200
      }
    );
  }

  // Create a Supabase client with the Auth context of the logged in user
  const authorization = req.headers.get('Authorization')!;
  const supabaseClient = createSupabaseClient();
  if (!supabaseClient) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  // Get the JWT token from the request
  const token = authorization.replace('Bearer ', '');

  // Verify the request method
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const { target_user_id, new_role } = requestData as UpdateRoleRequest;

    // Validate inputs
    if (!target_user_id || !new_role) {
      return jsonResponse(400, { error: 'Missing required fields' });
    }

    // Verify if role is valid
    if (new_role !== 'user' && new_role !== 'admin') {
      return jsonResponse(400, { error: 'Invalid role specified' });
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Pragma': 'no-cache'
          },
          status: 401
        }
      );
    }

    // Check if the current user is an admin
    const { data: adminCheckData, error: adminCheckError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminCheckError || !adminCheckData) {
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status', details: adminCheckError?.message }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Pragma': 'no-cache'
          },
          status: 403
        }
      );
    }

    if (adminCheckData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can update user roles' }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Pragma': 'no-cache'
          },
          status: 403
        }
      );
    }

    // Update the user's role
    const { data: updateData, error: updateError } = await supabaseClient
      .from('profiles')
      .update({ role: new_role, updated_at: new Date().toISOString() })
      .eq('id', target_user_id)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update user role', details: updateError.message }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Pragma': 'no-cache'
          },
          status: 500
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'User role updated successfully',
        user: {
          id: updateData.id,
          role: updateData.role,
          business_name: updateData.business_name
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Pragma': 'no-cache'
        },
        status: 200
      }
    );
  } catch (error) {
    return handleCommonError(error, "User role update");
  }
});