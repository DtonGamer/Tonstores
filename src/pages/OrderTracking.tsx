import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, CheckCircle, Truck, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getStorageUrl, imageDefaults } from "@/utils/imageHelpers";
import { EscrowService } from "@/services/EscrowService";
import { toast } from "@/components/ui/use-toast";

const OrderStatus = ({ status, type = "order" }: { status: string, type?: "order" | "payment" }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'paid':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'processing':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'shipped':
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case 'delivered':
        return "bg-green-100 text-green-800 border-green-200";
      case 'cancelled':
        return "bg-red-100 text-red-800 border-red-200";
      case 'failed':
        return "bg-red-100 text-red-800 border-red-200";
      case 'held':
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 'released':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'refunded':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge className={`${getStatusColor()} py-1 px-3 font-semibold text-sm`}>
      {type === "payment" ? "Payment: " : ""}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const OrderProgress = ({ status }: { status: string }) => {
  // Define order progress steps
  const steps = ["pending", "paid", "processing", "shipped", "delivered"];
  const currentStepIndex = steps.indexOf(status.toLowerCase());
  
  // Icons for each step
  const icons = {
    pending: <Clock className="h-6 w-6" />,
    paid: <CheckCircle className="h-6 w-6" />,
    processing: <Package className="h-6 w-6" />,
    shipped: <Truck className="h-6 w-6" />,
    delivered: <CheckCircle className="h-6 w-6" />,
  };

  return (
    <div className="mt-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isActive = index === currentStepIndex;
          
          return (
            <div key={step} className="flex items-center gap-3 sm:gap-0 sm:flex-col">
              <div className={`
                flex items-center justify-center h-12 w-12 rounded-full flex-shrink-0
                ${isCompleted 
                  ? "bg-Tonstores-green text-white" 
                  : "bg-gray-200 text-gray-400"}
                ${isActive ? "ring-4 ring-green-100" : ""}
              `}>
                {icons[step as keyof typeof icons]}
              </div>
              <span className={`text-xs sm:text-sm ${isCompleted ? "font-medium" : "text-gray-500"}`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block h-1 flex-1 sm:mt-4 ${
                  isCompleted ? "bg-Tonstores-green" : "bg-gray-200"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderDetails } = useOrders();
  
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    const loadOrderDetails = async () => {
      if (!id) {
        setError("No order ID provided");
        setIsLoading(false);
        return;
      }
      
      try {
        // Try to get order details
        const { order, items } = await getOrderDetails(id);
        if (mounted) {
          setOrder(order);
          setOrderItems(items);
          setError(null);
        }
      } catch (error: any) {
        // If order not found and we haven't reached max retries
        if (error.message === "Order not found" && retryCount < maxRetries) {
          retryCount++;
         // console.log(`Retry ${retryCount} for order ${id}`);
          
          // Add a small delay before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try again
          await loadOrderDetails();
        } else if (mounted) {
          console.error("Failed to load order details:", error);
          setError(error.message || "Failed to load order details");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    setIsLoading(true);
    loadOrderDetails();

    return () => {
      mounted = false;
    };
  }, [id, getOrderDetails]);

  // Function to confirm delivery and release funds from escrow
  const handleConfirmDelivery = async () => {
    if (!order?.id) {
      toast({
        title: "Error",
        description: "Order ID is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Confirm delivery and release funds from escrow
      const result = await EscrowService.confirmDeliveryAndReleaseFunds({
        orderId: order.id
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Delivery confirmed and funds released successfully",
        });

        // Refresh the order data
        const { order: updatedOrder, items } = await getOrderDetails(order.id);
        setOrder(updatedOrder);
        setOrderItems(items);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to confirm delivery",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error confirming delivery:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm delivery",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Tonstores-green"></div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find the order you're looking for."}
          </p>
          <div className="space-x-4">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="mr-2"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => navigate("/")}
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <button
          onClick={() => {
            // Check if browser history has previous entries
            if (window.history.length > 1) {
              window.history.back();
            } else {
              // Fallback to orders page if no history
              navigate('/orders');
            }
          }}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 sm:mb-6"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back
        </button>
        
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 dark:text-white">Track Your Order</h1>
        
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-4 sm:mb-6">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Order Number</p>
                <p className="font-semibold text-base sm:text-lg dark:text-white">{order.id.slice(0, 8)}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <OrderStatus status={order.status} />
                {order.payment_status && (
                  <OrderStatus status={order.payment_status} type="payment" />
                )}
              </div>
            </div>
            
            <OrderProgress status={order.status} />

            {/* Show delivery confirmation button if order is shipped and escrow is held */}
            {order.status === 'shipped' && order.escrow_status === 'held' && (
              <div className="mt-4 sm:mt-6">
                <Button
                  onClick={handleConfirmDelivery}
                  className="bg-green-600 hover:bg-green-700 w-full text-sm sm:text-base py-5 sm:py-auto"
                >
                  Confirm Delivery & Release Payment
                </Button>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 dark:text-gray-400">
                  Click this button when you have received your order to release payment to the seller
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
              <div>
                <h3 className="font-semibold mb-2 dark:text-white text-sm sm:text-base">Customer</h3>
                <p className="dark:text-white text-sm">{order.customer_name}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm break-all">{order.customer_email}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{order.customer_phone}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 dark:text-white text-sm sm:text-base">Order Date</h3>
                <p className="dark:text-white text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 dark:text-white text-sm sm:text-base">Total Amount</h3>
                <p className="font-semibold text-base sm:text-lg dark:text-white">
                  ₦{(order.total_amount / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                {order.payment_reference && (
                  <p className="text-gray-600 dark:text-gray-300 text-xs break-all">
                    Ref: {order.payment_reference}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 dark:text-white">Order Items</h2>
            
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 py-3 border-b dark:border-gray-700 last:border-0">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    {item.product?.image_url ? (
                      <img
                        src={getStorageUrl(item.product.image_url)}
                        alt={item.product?.name || "Product"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = imageDefaults.placeholderImage;
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium dark:text-white text-sm sm:text-base truncate">{item.product?.name || "Product"}</h3>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        {item.quantity} x ₦{(item.price_at_purchase / 100).toFixed(2)}
                      </span>
                      <span className="font-semibold dark:text-white text-sm">
                        ₦{((item.quantity * item.price_at_purchase) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4 sm:my-6" />
            
            <div className="flex justify-between items-center font-bold text-base sm:text-lg">
              <span className="text-sm sm:text-base">Total</span>
              <span className="text-base sm:text-lg">
                ₦{(order.total_amount / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTracking;
