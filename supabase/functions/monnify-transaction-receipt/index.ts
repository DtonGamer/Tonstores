import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from 'https://esm.sh/resend@3.2.0';

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

// Declare environment variables
declare global {
  interface WindowOrWorkerGlobalScope {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  }
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Parse JSON body
  let data;
  try {
    data = await req.json();
  } catch (err) {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  // Check for development mode
  const isDevelopmentMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true";

  // Destructure required fields
  const { reference, seller_id } = data;

  // Handle development mode
  if (isDevelopmentMode) {
    console.log("Development mode - simulating transaction receipt processing");
    return jsonResponse(200, {
      success: true,
      message: "Transaction receipt processing simulated in development mode",
      dev_mode: true,
      reference: reference || "test-ref",
      details: "This is a simulation in development mode"
    });
  }

  // Validate required fields
  if (!reference) {
    return jsonResponse(400, { error: "Transaction reference is required" });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get Resend API key for email sending
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return jsonResponse(500, { error: "Resend API key not configured" });
  }

  const resend = new Resend(resendApiKey);

  try {
    // First, get the transaction details from Monnify
    // For this, we'll need to store transaction details in our database when they come in via webhook
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        user_id
      `)
      .eq('payment_reference', reference)
      .or('transaction_reference.eq.'+reference, { foreignTable: 'orders' })
      .single();

    if (orderError || !orderData) {
      console.error("Could not find order with reference:", reference, orderError);
      return jsonResponse(404, { error: "Order not found for the given reference" });
    }

    // If seller_id was provided, verify it matches the order
    if (seller_id && orderData.user_id !== seller_id) {
      return jsonResponse(403, { error: "Unauthorized: Seller ID does not match order" });
    }

    // Get customer's email from the order
    const customerEmail = orderData.customer_email;
    if (!customerEmail) {
      return jsonResponse(400, { error: "Customer email not available" });
    }

    // Get seller details to send them a copy too
    const { data: sellerData, error: sellerError } = await supabase
      .from('profiles')
      .select('business_name, contact_email')
      .eq('id', orderData.user_id)
      .single();

    const sellerEmail = sellerData?.contact_email || '';
    const sellerBusinessName = sellerData?.business_name || 'Seller';

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderData.id);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return jsonResponse(500, { error: "Error fetching order items" });
    }

    // Calculate totals for the receipt
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0);

    // Get customer details
    const customerName = orderData.customer_name || 'Customer';

    // Generate receipt HTML for customer
    const customerReceiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
          .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #333; margin: 20px 0; }
          .details { margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 14px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>Payment Receipt</h1>
          </div>
          
          <div class="details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderData.id}</p>
            <p><strong>Transaction Reference:</strong> ${reference}</p>
            <p><strong>Date:</strong> ${new Date(orderData.created_at).toLocaleString()}</p>
            <p><strong>Seller:</strong> ${sellerBusinessName}</p>
          </div>
          
          <h3>Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr>
                  <td>${item.product_name || 'Product'}</td>
                  <td>${item.quantity}</td>
                  <td>₦${(item.price_at_purchase / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>₦${((item.price_at_purchase * item.quantity) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total: ₦${(totalAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>This is an automated receipt from TonStores.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send customer receipt
    const customerEmailResponse = await resend.emails.send({
      from: 'receipts@tonstores.com',
      to: customerEmail,
      subject: `Payment Receipt - Order ${orderData.id}`,
      html: customerReceiptHtml,
    });

    // Generate receipt HTML for seller
    const sellerReceiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
          .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #333; margin: 20px 0; }
          .details { margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 14px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>Sales Receipt - Your Store</h1>
          </div>
          
          <div class="details">
            <h3>Sale Details</h3>
            <p><strong>Order ID:</strong> ${orderData.id}</p>
            <p><strong>Transaction Reference:</strong> ${reference}</p>
            <p><strong>Date:</strong> ${new Date(orderData.created_at).toLocaleString()}</p>
            <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
            <p><strong>Payment Provider:</strong> Monnify</p>
          </div>
          
          <h3>Sold Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr>
                  <td>${item.product_name || 'Product'}</td>
                  <td>${item.quantity}</td>
                  <td>₦${(item.price_at_purchase / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>₦${((item.price_at_purchase * item.quantity) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total: ₦${(totalAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div class="footer">
            <p>You made a sale! Check your Monnify dashboard for payment details.</p>
            <p>This is an automated sales notification from TonStores.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send seller receipt if email is available
    let sellerEmailResponse = null;
    if (sellerEmail) {
      sellerEmailResponse = await resend.emails.send({
        from: 'sales@tonstores.com',
        to: sellerEmail,
        subject: `New Sale - Order ${orderData.id}`,
        html: sellerReceiptHtml,
      });
    }

    // Get customer and seller phone numbers for WhatsApp notifications
    const customerPhone = orderData.customer_phone;

    const { data: sellerProfile, error: sellerProfileError } = await supabase
      .from('profiles')
      .select('whatsapp_support')
      .eq('id', orderData.user_id)
      .single();

    // Prepare order details for WhatsApp notification
    const orderDetails = {
      items: orderItems.map(item => ({
        name: item.product_name || 'Product',
        quantity: item.quantity,
        price: item.price_at_purchase
      })),
      total_amount: totalAmount,
      customer_name: orderData.customer_name || customerName,
      customer_email: customerEmail,
      payment_reference: reference
    };

    // Send WhatsApp notifications if phone numbers are available
    if (customerPhone && sellerProfile?.whatsapp_support) {
      try {
        // Prepare to call WhatsApp notification function
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

        if (supabaseUrl && anonKey) {
          const whatsappResponse = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              order_id: orderData.id,
              customer_phone: customerPhone,
              seller_phone: sellerProfile.whatsapp_support,
              order_details: orderDetails,
              dev_mode: isDevelopmentMode  // Pass through the same dev_mode setting
            })
          });

          const whatsappResult = await whatsappResponse.json();

          if (!whatsappResponse.ok) {
            console.error("Error sending WhatsApp notifications:", whatsappResult);
          } else {
            console.log("WhatsApp notifications sent successfully:", whatsappResult);
          }
        }
      } catch (whatsappError) {
        console.error("Unexpected error sending WhatsApp notifications:", whatsappError);
      }
    }

    // Update the order to mark receipts as sent
    await supabase
      .from('orders')
      .update({
        notes: orderData.notes
          ? `${orderData.notes}, Receipts sent: ${new Date().toISOString()}`
          : `Receipts sent: ${new Date().toISOString()}`
      })
      .eq('id', orderData.id);

    return jsonResponse(200, {
      success: true,
      message: "Receipts sent successfully",
      sentTo: {
        customer: customerEmail,
        seller: sellerEmail
      },
      whatsappNotifications: {
        customer: !!customerPhone,
        seller: !!sellerProfile?.whatsapp_support
      },
      transactionReference: reference,
      orderId: orderData.id
    });
  } catch (error) {
    console.error('Error processing transaction receipt:', error);
    return jsonResponse(500, { 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: 'Failed to process transaction receipt'
    });
  }
});