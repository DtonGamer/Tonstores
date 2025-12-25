import { useState, useEffect, useCallback, useRef } from "react";
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
import { getCurrentUserId } from "@/utils/sessionHelpers";
import { QuickAccountCreation } from "@/components/checkout/QuickAccountCreation";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState<any>(null);
  const [formData, setFormData] = useState<OrderFormData | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showQuickAccount, setShowQuickAccount] = useState(false);
  const [checkoutData, setCheckoutData] = useState<OrderFormData | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

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
  } = useSimplifiedPaystackPayment();
  
  // Get catalog and cart
  const [catalog, setCatalog] = useState<any>(null);
  const cart = useCart(catalog?.id || "");
  
  // Use refs to store latest values to avoid stale closure issues
  const catalogRef = useRef<any>(null);
  const checkoutDataRef = useRef<OrderFormData | null>(null);
  
  // Update refs whenever state changes
  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);
  
  useEffect(() => {
    checkoutDataRef.current = checkoutData;
  }, [checkoutData]);
  
  // Use ref to prevent duplicate catalog loads
  const catalogLoadedRef = useRef(false);
  const sessionStorageKey = `catalog_${slug}`;
  
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
          },
          replace: true // Use replace to avoid adding to history stack
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
            },
            replace: true // Use replace to avoid adding to history stack
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
  
  // Load catalog data - OPTIMIZED VERSION
  useEffect(() => {
    // Prevent duplicate loads
    if (catalogLoadedRef.current) return;
    
    const loadCatalog = async () => {
      if (!slug) {
        setIsLoadingCatalog(false);
        return;
      }
      
      try {
        setIsLoadingCatalog(true);
        
        // TRY CACHE FIRST for instant load
        const cachedCatalog = sessionStorage.getItem(sessionStorageKey);
        if (cachedCatalog) {
          try {
            const catalogData = JSON.parse(cachedCatalog);
            setCatalog(catalogData);
            setIsLoadingCatalog(false);
            catalogLoadedRef.current = true;
            
            // Optionally validate in background without blocking UI
            getCatalogBySlug(slug).then(freshData => {
              if (freshData && JSON.stringify(freshData) !== cachedCatalog) {
                setCatalog(freshData);
                sessionStorage.setItem(sessionStorageKey, JSON.stringify(freshData));
              }
            }).catch(err => {
              console.error("Background catalog validation failed:", err);
            });
            
            return;
          } catch (parseError) {
            console.error("Failed to parse cached catalog:", parseError);
            sessionStorage.removeItem(sessionStorageKey);
          }
        }
        
        // No cache available, fetch fresh data
        const catalogData = await getCatalogBySlug(slug);
        if (catalogData) {
          setCatalog(catalogData);
          sessionStorage.setItem(sessionStorageKey, JSON.stringify(catalogData));
          catalogLoadedRef.current = true;
        } else {
          toast({
            title: "Catalog Not Found",
            description: "The requested catalog could not be found.",
            variant: "destructive",
          });
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Failed to load catalog:", error);
        toast({
          title: "Error Loading Catalog",
          description: "There was a problem loading the catalog.",
          variant: "destructive",
        });
        navigate("/", { replace: true });
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    
    loadCatalog();
  }, [slug]); // Only depend on slug
  
  // Handle form submission - show quick account creation or proceed directly if authenticated
  const handleCheckout = async (formData: OrderFormData) => {
    // Critical: Check catalog is loaded first
    if (!catalog) {
      toast({
        title: "Error",
        description: "Catalog data is not loaded yet. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    if (cart.isEmpty) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add some products before checking out.",
        variant: "destructive",
      });
      navigate(`/c/${slug}`, { replace: true });
      return;
    }

    // Store form data for later use
    setCheckoutData(formData);
    setFormData(formData); // Set the form data for payment retry

    // Check if user is already authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // User is already authenticated, proceed directly to order creation
      await handleAccountCreated(session.user.id);
    } else {
      // User is not authenticated, show quick account creation
      setShowQuickAccount(true);
    }
  };

  // Handle account creation and order placement
  const handleCreateAccountAndOrder = async () => {
    if (!checkoutData || !catalog) return;

    try {
      setIsSubmitting(true);
      setPaymentError(null);
      console.log("Starting checkout process with form data:", checkoutData);

      // Create order in database
      const order = await createOrder(
        catalog.id,
        catalog.user_id,
        checkoutData,
        cart.items
      );

      console.log("Order created successfully:", order);
      setOrderId(order.id);
      setOrderCreated(order);

      // Initialize payment
      await initializePaymentWithRetry(order, checkoutData);
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

  // Handle account creation completion - create the order
  const handleAccountCreated = useCallback(async (userId: string) => {
    // Use refs to get the latest values and avoid stale closure issues
    const currentCheckoutData = checkoutDataRef.current;
    const currentCatalog = catalogRef.current;
    
    console.log("handleAccountCreated called with:", { 
      userId, 
      hasCheckoutData: !!currentCheckoutData, 
      hasCatalog: !!currentCatalog 
    });
    
    if (!currentCheckoutData || !currentCatalog) {
      console.error("Missing data:", { 
        checkoutData: currentCheckoutData, 
        catalog: currentCatalog 
      });
      
      toast({
        title: "Error",
        description: "Missing checkout data or catalog information. Please go back and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setPaymentError(null);
      console.log("Starting checkout process with form data:", currentCheckoutData);

      // Create order in database
      const order = await createOrder(
        currentCatalog.id,
        currentCatalog.user_id,
        currentCheckoutData,
        cart.items
      );

      console.log("Order created successfully:", order);
      setOrderId(order.id);
      setOrderCreated(order);

      // Initialize payment
      await initializePaymentWithRetry(order, currentCheckoutData);
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
  }, [cart.items, createOrder, orderId]); // Removed checkoutData and catalog from dependencies

  // Function to handle payment initialization with retry logic
  const initializePaymentWithRetry = async (order: any, formData: OrderFormData) => {
    console.log("Initializing payment for order:", order.id);

    // Get current user ID
    const userId = await getCurrentUserId();
    console.log("Current user ID:", userId);

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
          navigate(`/order-success/${order.id}`, { state: navigationState, replace: true });
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

    // Get current user ID
    const userId = await getCurrentUserId();
    console.log("Current user ID for retry:", userId);

    await initializePaymentWithRetry(orderCreated, formData);
  };
  
  // Show loading state while catalog is loading
  if (isLoadingCatalog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Tonstores-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }
  
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
            onClick={() => navigate(`/c/${slug}`, { replace: true })}
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
              onClick={() => navigate(`/c/${slug}`, { replace: true })}
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
                  
                  {showQuickAccount && checkoutData ? (
                    <QuickAccountCreation
                      email={checkoutData.customer_email}
                      name={checkoutData.customer_name}
                      phone={checkoutData.customer_phone}
                      onAccountCreated={handleAccountCreated}
                    />
                  ) : paymentRetryAvailable ? (
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