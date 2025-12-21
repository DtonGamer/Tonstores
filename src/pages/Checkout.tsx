import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useCatalog } from "@/hooks/useCatalog";
import { useOrders, OrderFormData } from "@/hooks/useOrders";
import { useSimplifiedPaystackPayment } from "@/hooks/useSimplifiedPaystackPayment";
import { toast } from "@/components/ui/use-toast";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { Card, CardContent } from "@/components/ui/card";
import { CancelPaymentDialog } from "@/components/modals/CancelPaymentDialog";
import { PaymentStatusService } from "@/services/PaymentStatusService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { setGuestSessionParam, getGuestUserId } from "@/utils/sessionParams";

const Checkout = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState<any>(null);
  const [formData, setFormData] = useState<OrderFormData | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { getCatalogBySlug } = useCatalog();
  const { createOrder } = useOrders();
  const {
    initializePayment,
    isLoading: isPaymentLoading,
    showCancelConfirm,
    handleCancelConfirm,
    handleCancelDeny,
    paymentRetryAvailable,
    currentOrderId
  } = usePaystackPayment();
  
  // Get catalog and cart
  const [catalog, setCatalog] = useState<any>(null);
  const cart = useCart(catalog?.id || "");
  
  // Handle payment cancellation
  const handlePaymentCancel = async () => {
    if (orderId) {
      try {
        await PaymentStatusService.updateOrderStatusClient(orderId, 'cancelled', 'cancelled');
      } catch (error) {
        console.error("Error updating order status during cancellation:", error);
      }
      
      setIsSubmitting(false);
      toast({
        title: "Payment Cancelled",
        description: "You have cancelled the payment process.",
        variant: "destructive",
      });
      
      // Navigate back to catalog view with payment_cancelled flag
      if (slug) {
        navigate(`/c/${slug}`, { 
          state: { 
            payment_cancelled: true,
            order_id: orderId
          } 
        });
      }
    } else {
      console.error("Cannot cancel payment: Order ID is missing");
    }
  };

  // Handle payment failure
  const handlePaymentFailure = async (errorMessage: string) => {
    if (orderId) {
      try {
        await PaymentStatusService.updateOrderStatusClient(orderId, 'failed', 'failed');
        
        setIsSubmitting(false);
        toast({
          title: "Payment Failed",
          description: errorMessage || "Your payment could not be processed.",
          variant: "destructive",
        });
        
        if (slug) {
          navigate(`/c/${slug}`, { 
            state: { 
              payment_failed: true,
              order_id: orderId
            } 
          });
        }
      } catch (error) {
        console.error("Error updating order status during payment failure:", error);
        setIsSubmitting(false);
        toast({
          title: "Payment Error",
          description: "There was a problem processing your payment.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Load catalog data
  useEffect(() => {
    const loadCatalog = async () => {
      if (!slug) return;
      
      try {
        const catalogData = await getCatalogBySlug(slug);
        if (catalogData) {
          setCatalog(catalogData);
        } else {
          toast({
            title: "Catalog Not Found",
            description: "The requested catalog could not be found.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to load catalog:", error);
        toast({
          title: "Error Loading Catalog",
          description: "There was a problem loading the catalog.",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    
    loadCatalog();
  }, [slug, getCatalogBySlug, navigate, toast]);
  
  // Handle form submission and order creation
  const handleCheckout = async (formData: OrderFormData) => {
    if (!catalog || cart.isEmpty) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add some products before checking out.",
        variant: "destructive",
      });
      navigate(`/c/${slug}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormData(formData);
      setPaymentError(null);
      console.log("Starting checkout process with form data:", formData);
      
      // Create order in database
      const order = await createOrder(
        catalog.id,
        catalog.user_id,
        formData,
        cart.items
      );
      
      console.log("Order created successfully:", order);
      setOrderId(order.id);
      setOrderCreated(order);
      
      // Initialize payment
      await initializePaymentWithRetry(order, formData);
    } catch (error: any) {
      console.error("Checkout error:", error);
      setPaymentError(error.message || "There was a problem processing your checkout.");
      toast({
        title: "Checkout Failed",
        description: error.message || "There was a problem processing your checkout.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      
      // Handle the case where order was created but payment failed
      if (orderId) {
        try {
          await PaymentStatusService.updateOrderStatusClient(orderId, 'failed', 'failed');
        } catch (statusError) {
          console.error("Error updating order status after failed payment:", statusError);
        }
      }
    }
  };

  // Function to handle payment initialization with retry logic
  const initializePaymentWithRetry = async (order: any, formData: OrderFormData) => {
    console.log("Initializing payment for order:", order.id);
    
    // For guest orders, ensure guest session params are properly set
    const guestId = getGuestUserId();
    await setGuestSessionParam(guestId);
    
    try {
      await initializePayment({
        order,
        customerName: formData.customer_name,
        customerEmail: formData.customer_email,
        customerPhone: formData.customer_phone,
        onSuccess: (reference) => {
          console.log("Payment successful with reference:", reference);
          // Clear cart and redirect to success page
          cart.clearCart();
          
          // Create state object with returnUrl to enable proper redirection back to catalog
          const navigationState = { 
            orderDetails: order,
            paymentReference: reference,
            returnUrl: catalog?.slug ? `/c/${catalog.slug}` : null // Add the catalog URL with slug for return navigation
          };
          
          // Redirect to success page and stay there
          navigate(`/order-success/${order.id}`, { state: navigationState });
        },
        onClose: () => {
          console.log("Payment modal closed");
          // Do not clear cart on close to allow user to retry payment
          setIsSubmitting(false);
        }
      });
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      setPaymentError(error.message || "Failed to initialize payment");
      setIsSubmitting(false);
    }
  };

  // Handle retry payment
  const handleRetryPayment = async () => {
    if (!orderCreated || !formData) {
      toast({
        title: "Cannot Retry Payment",
        description: "Missing order information. Please try again from the beginning.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);
    
    // For guest orders, ensure guest session params are properly set before retrying
    const guestId = getGuestUserId();
    await setGuestSessionParam(guestId);
    
    await initializePaymentWithRetry(orderCreated, formData);
  };
  
  if (!catalog || cart.isEmpty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before proceeding to checkout.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/c/${slug}`)}
          >
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="flex items-center mb-4"
              onClick={() => navigate(`/c/${slug}`)}
            >
              <ArrowLeft className="mr-2" size={18} />
              Back to Catalog
            </Button>
            <h1 className="text-2xl font-bold text-Tonstores-darkblue">Checkout</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                  
                  {paymentError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Connection Error</AlertTitle>
                      <AlertDescription>We are having trouble connecting to the payment provider.</AlertDescription>
                    </Alert>
                  )}
                  
                  {paymentRetryAvailable ? (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        We encountered an issue connecting to our payment provider. Your order has been created, but we need to retry the payment.
                      </p>
                      <Button 
                        onClick={handleRetryPayment}
                        disabled={isSubmitting || isPaymentLoading}
                        className="w-full bg-Tonstores-green hover:bg-Tonstores-darkblue flex items-center justify-center"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {isSubmitting || isPaymentLoading ? "Processing..." : "Continue Payment"}
                      </Button>
                    </div>
                  ) : (
                    <CheckoutForm 
                      onSubmit={handleCheckout} 
                      isLoading={isSubmitting || isPaymentLoading} 
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Order Summary */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-4">
                    {cart.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="font-medium">
                            {item.name} 
                            <span className="text-gray-500 ml-1">x {item.quantity}</span>
                          </div>
                        </div>
                        <div className="font-medium">
                          ₦{((item.price * item.quantity) / 100).toLocaleString(undefined, {
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>
                      ₦{(cart.total / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment cancel confirmation dialog */}
      {showCancelConfirm && (
        <CancelPaymentDialog 
          open={showCancelConfirm}
          onOpenChange={(open) => !open && handleCancelDeny()}
          onConfirm={handlePaymentCancel}
        />
      )}
    </>
  );
};

export default Checkout;
