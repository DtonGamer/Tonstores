import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const jsonResponse = (statusCode: number, body: any) => {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Pragma": "no-cache"
    },
  });
};

// Declare environment variables
declare global {
  interface WindowOrWorkerGlobalScope {
    AISENSY_API_URL: string;
    AISENSY_API_KEY: string;
    AISENSY_SENDER_ID: string;
  }
}

interface WhatsAppNotificationData {
  order_id: string;
  customer_phone: string;
  seller_phone: string;
  order_details: {
    items: Array<{ name: string; quantity: number; price: number }>;
    total_amount: number;
    customer_name: string;
    customer_email?: string;
    payment_reference?: string;
  };
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

  try {
    const data: WhatsAppNotificationData = await req.json();
    const { order_id, customer_phone, seller_phone, order_details, dev_mode } = data;

    // Check for development mode
    const isDevelopmentMode = dev_mode || Deno.env.get("DEV_MODE") === "true";

    // Handle development mode
    if (isDevelopmentMode) {
      console.log("Development Mode: Simulating WhatsApp notifications", {
        orderId: order_id,
        customerPhone: customer_phone,
        sellerPhone: seller_phone,
        orderDetails: order_details
      });

      return jsonResponse(200, {
        status: true,
        message: "WhatsApp notifications sent successfully (Development Mode)",
        dev_mode: true,
        notifications_sent: {
          customer: true,
          seller: true
        }
      });
    }

    // Validate required fields
    if (!order_id || !customer_phone || !seller_phone || !order_details) {
      return jsonResponse(400, {
        error: "Missing required fields",
        required: ["order_id", "customer_phone", "seller_phone", "order_details"]
      });
    }

    // Get Aisensy API credentials
    const AISENSY_API_URL = Deno.env.get("AISENSY_API_URL");
    const AISENSY_API_KEY = Deno.env.get("AISENSY_API_KEY");
    const AISENSY_SENDER_ID = Deno.env.get("AISENSY_SENDER_ID");

    if (!AISENSY_API_URL || !AISENSY_API_KEY || !AISENSY_SENDER_ID) {
      return jsonResponse(500, {
        error: "Aisensy API credentials not configured",
        details: {
          hasUrl: !!AISENSY_API_URL,
          hasApiKey: !!AISENSY_API_KEY,
          hasSenderId: !!AISENSY_SENDER_ID
        }
      });
    }

    // Format phone numbers (remove any non-digit characters except + at the beginning)
    const formatPhoneNumber = (phone: string): string => {
      const cleaned = phone.replace(/\D/g, '');
      // Add country code if not present
      if (cleaned.length === 10) {
        return `234${cleaned}`;
      } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return `234${cleaned.substring(1)}`;
      }
      return cleaned;
    };

    const formattedCustomerPhone = formatPhoneNumber(customer_phone);
    const formattedSellerPhone = formatPhoneNumber(seller_phone);

    // Prepare messages for customer and seller
    const customerMessage = {
      recipient: formattedCustomerPhone,
      senderId: AISENSY_SENDER_ID,
      message: `🎉 *Order Confirmed!* 

*Order ID:* ${order_id.substring(0, 8)}
*Items:* ${order_details.items.map(item => `${item.name} x${item.quantity}`).join(',\\n')}
*Total:* ₦${(order_details.total_amount / 100).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
*Customer:* ${order_details.customer_name}

Thank you for your purchase! Your order is being processed. You can contact the seller directly for updates.`
    };

    const sellerMessage = {
      recipient: formattedSellerPhone,
      senderId: AISENSY_SENDER_ID,
      message: `📦 *New Order Received!* 

*Order ID:* ${order_id.substring(0, 8)}
*Customer:* ${order_details.customer_name}
*Items:* ${order_details.items.map(item => `${item.name} x${item.quantity}`).join(',\\n')}
*Total Amount:* ₦${(order_details.total_amount / 100).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
*Payment Reference:* ${order_details.payment_reference || 'N/A'}

A customer has placed an order on your TonStores catalog. Please prepare for fulfillment.`
    };

    // Send WhatsApp messages using Aisensy API
    const sendCustomerMessage = fetch(`${AISENSY_API_URL}/message/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AISENSY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerMessage)
    });

    const sendSellerMessage = fetch(`${AISENSY_API_URL}/message/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AISENSY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sellerMessage)
    });

    // Wait for both messages to be sent
    const [customerResponse, sellerResponse] = await Promise.all([
      sendCustomerMessage,
      sendSellerMessage
    ]);

    const customerResult = await customerResponse.json();
    const sellerResult = await sellerResponse.json();

    const customerSuccess = customerResponse.ok;
    const sellerSuccess = sellerResponse.ok;

    if (customerSuccess && sellerSuccess) {
      // Log successful notifications
      console.log("WhatsApp notifications sent successfully", {
        orderId: order_id,
        customerPhone: formattedCustomerPhone,
        sellerPhone: formattedSellerPhone
      });

      return jsonResponse(200, {
        status: true,
        message: "WhatsApp notifications sent successfully to both customer and seller",
        notifications_sent: {
          customer: true,
          seller: true
        },
        customer_response: customerResult,
        seller_response: sellerResult
      });
    } else {
      // Log partial failure
      console.error("Partial failure in sending WhatsApp notifications", {
        orderId: order_id,
        customerSuccess,
        sellerSuccess,
        customerError: customerSuccess ? null : customerResult,
        sellerError: sellerSuccess ? null : sellerResult
      });

      return jsonResponse(207, { // 207 Multi-Status
        status: "partial_success",
        message: "Some WhatsApp notifications failed to send",
        notifications_sent: {
          customer: customerSuccess,
          seller: sellerSuccess
        },
        errors: {
          customer: customerSuccess ? null : customerResult,
          seller: sellerSuccess ? null : sellerResult
        }
      });
    }
  } catch (error: any) {
    console.error("Error sending WhatsApp notifications:", error);
    return jsonResponse(500, {
      error: error.message || "Internal server error",
      details: error.stack || "No stack trace available"
    });
  }
});