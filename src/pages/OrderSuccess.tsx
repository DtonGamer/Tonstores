import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Eye, Phone } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StockService } from "@/services/StockService";
import { toast } from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";

// WhatsApp icon component
const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4.02a7.94 7.94 0 0 0-7.04 11.62L4 20.98l5.4-.96a7.93 7.93 0 0 0 3.8.97h.04A7.94 7.94 0 0 0 17.6 6.32zm-5.57 12.17h-.03a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.59 6.59 0 0 1-1.01-3.49 6.59 6.59 0 0 1 6.59-6.59 6.56 6.56 0 0 1 4.66 1.93 6.52 6.52 0 0 1 1.93 4.67 6.6 6.6 0 0 1-6.55 6.57zm3.61-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.78-.11.13-.23.15-.43.05a5.47 5.47 0 0 1-1.6-.99 6 6 0 0 1-1.11-1.38c-.12-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.14.03-.26-.02-.36-.05-.1-.45-1.08-.62-1.47-.16-.39-.33-.33-.45-.34-.12-.01-.25-.01-.38-.01-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63 0 .96.7 1.9.8 2.03.1.14 1.37 2.1 3.32 2.94.46.2.83.32 1.11.41.47.15.89.13 1.23.08.37-.06 1.15-.47 1.31-.93.16-.46.16-.85.11-.93-.05-.08-.19-.13-.4-.23z" 
    fill="currentColor" />
  </svg>
);

const OrderSuccess = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { getOrderDetails } = useOrders();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sellerContact, setSellerContact] = useState<string | null>(null);

  const paymentReference = location.state?.paymentReference;
  const orderDetails = location.state?.orderDetails;
  const returnUrl = location.state?.returnUrl;

  // Store returnUrl in localStorage for potential future use
  useEffect(() => {
    if (returnUrl) {
      localStorage.setItem('lastReturnUrl', returnUrl);
    }
  }, [returnUrl]);

  const handleRedirect = () => {
    // If we have the order with catalog info, use that
    if (order?.catalogs?.slug) {
      navigate(`/c/${order.catalogs.slug}`);
      return;
    }
    
    // Otherwise, try to use returnUrl from state or localStorage
    const url = returnUrl || localStorage.getItem('lastReturnUrl');
    
    // Check if the URL is a valid catalog URL
    if (url && url.startsWith('/c/') && url.length > 3) {
      navigate(url);
      return;
    }
    
    // If no specific catalog is available, redirect to home
    navigate('/');
  };

  // Fetch seller's WhatsApp contact
  const fetchSellerContact = async (catalogId: string) => {
    if (!catalogId) return;
    
    try {
      // First, find the seller's user_id from the catalog
      const { data: catalogData, error: catalogError } = await supabase
        .from('catalogs')
        .select('user_id')
        .eq('id', catalogId)
        .single();
        
      if (catalogError || !catalogData) {
        console.error("Failed to fetch catalog owner:", catalogError);
        return;
      }
      
      // Then, get the seller's WhatsApp contact from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('whatsapp_support')
        .eq('id', catalogData.user_id)
        .single();
        
      if (profileError || !profileData) {
        console.error("Failed to fetch seller profile:", profileError);
        return;
      }
      
      if (profileData.whatsapp_support) {
        setSellerContact(profileData.whatsapp_support);
      }
    } catch (error) {
      console.error("Error fetching seller contact:", error);
    }
  };

  const formatWhatsAppNumber = (number: string) => {
    // Remove any non-digit characters
    const digitsOnly = number.replace(/\D/g, '');
    
    // Add plus sign if it doesn't have one
    return digitsOnly.startsWith('234') || digitsOnly.startsWith('1') 
      ? `+${digitsOnly}` 
      : `+234${digitsOnly.replace(/^0+/, '')}`;
  };

  const openWhatsAppChat = () => {
    if (!sellerContact || !order) return;

    try {
      // Format the WhatsApp number
      const formattedNumber = formatWhatsAppNumber(sellerContact);
      
      // Create the message with order details
      const orderCode = order.id.slice(0, 8);
      const orderDate = new Date(order.created_at).toLocaleDateString();
      const orderAmount = (order.total_amount / 100).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      const message = `Hello! I just placed Order #${orderCode} on ${orderDate} for ₦${orderAmount}. I'd like to confirm my order details and delivery timeline. Thank you!`;
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
      
      // Open in a new window
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Error opening WhatsApp chat:", error);
      toast.error("Failed to open WhatsApp. Please try again.");
    }
  };

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        if (orderDetails) {
          setOrder(orderDetails);
          if (orderDetails.catalog_id) {
            await fetchSellerContact(orderDetails.catalog_id);
          }
        } else {
          try {
            const details = await getOrderDetails(id);
            setOrder(details.order);
            if (details.order?.catalog_id) {
              await fetchSellerContact(details.order.catalog_id);
            }
          } catch (error) {
            console.error("Failed to load order details:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderDetails();
  }, [id, orderDetails, getOrderDetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tonstores-green"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto p-4">
          <Button variant="ghost" className="flex items-center mb-6" onClick={handleRedirect}>
            <ArrowLeft className="mr-2" size={18} />
            Continue Shopping
          </Button>

          <Card className="border-green-100 shadow-md">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <CheckCircle size={64} className="text-green-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-center text-tonstores-darkblue mb-2">
                Thank You For Your Order!
              </h1>
              <p className="text-center text-gray-600 mb-6">
                Your order has been placed successfully and is being processed.
              </p>
              <Separator className="mb-6" />
              <div className="flex justify-center">
                <Button className="bg-tonstores-green hover:bg-tonstores-darkblue" onClick={handleRedirect}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto p-4">
        <Button variant="ghost" className="flex items-center mb-6" onClick={handleRedirect}>
          <ArrowLeft className="mr-2" size={18} />
          Continue Shopping
        </Button>

        <Card className="border-green-100 shadow-md">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-tonstores-darkblue mb-2">
              Thank You For Your Order!
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Your order has been placed successfully and is being processed.
            </p>
            <Separator className="mb-6" />
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium">{order.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">
                    ₦{(order.total_amount / 100).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="font-medium text-green-600">{order.payment_status || 'Paid'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Escrow Status</p>
                  <p className="font-medium text-orange-600">{order.escrow_status || 'Held'}</p>
                </div>
              </div>
              {paymentReference && (
                <div>
                  <p className="text-sm text-gray-500">Payment Reference</p>
                  <p className="font-medium">{paymentReference}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-tonstores-green hover:bg-tonstores-darkblue" onClick={() => navigate(`/order-tracking/${order.id}`)}>
                <Eye className="mr-2" size={18} />
                Track Your Order
              </Button>
              
              {sellerContact && (
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white" 
                  onClick={openWhatsAppChat}
                >
                  <WhatsAppIcon className="mr-2" />
                  Contact Seller
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccess;