import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Order } from "@/hooks/useOrders";
import { getStorageUrl, imageDefaults } from "@/utils/imageHelpers";

type OrderItem = {
  id: string;
  quantity: number;
  price_at_purchase: number;
  product_id: string;
  product?: {
    id: string;
    name: string;
    image_url: string | null;
  };
};

type OrderDetailsProps = {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string, paymentStatus?: string, escrowStatus?: string) => Promise<void>;
};

// Format social media source to display name
const formatSocialMediaSource = (source: string | null | undefined): string => {
  if (!source) return "Direct / Other";
  
  // Capitalize first letter
  return source.charAt(0).toUpperCase() + source.slice(1);
};

// Get badge color based on social media platform
const getSocialMediaColor = (source: string | null | undefined): string => {
  if (!source) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  
  switch(source.toLowerCase()) {
    case 'instagram':
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case 'facebook':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case 'twitter':
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300";
    case 'tiktok':
      return "bg-black/10 text-gray-800 dark:bg-white/10 dark:text-gray-300";
    case 'whatsapp':
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case 'youtube':
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case 'linkedin':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const OrderDetails = ({ order, onClose, onStatusUpdate }: OrderDetailsProps) => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status || "pending");
  const [escrowStatus, setEscrowStatus] = useState(order.escrow_status || "held");
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("order_items")
          .select(`
            id,
            quantity,
            price_at_purchase,
            product_id,
            product:product_id (
              id,
              name,
              image_url
            )
          `)
          .eq("order_id", order.id);
        
        if (error) throw error;
        
        setItems(data?.map(item => ({
          ...item,
          product: Array.isArray(item.product) && item.product.length > 0 
            ? item.product[0] 
            : item.product || undefined
        })) as OrderItem[] || []);
      } catch (error) {
        console.error("Error fetching order items:", error);
        toast({
          title: "Error",
          description: "Failed to load order details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderItems();
  }, [order.id]);
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      await onStatusUpdate(order.id, newStatus, undefined, undefined); // Don't change payment/escrow status when only changing business status
      setStatus(newStatus);

      toast({
        title: "Status updated",
        description: `Order status has been changed to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    try {
      setUpdating(true);
      await onStatusUpdate(order.id, status, newPaymentStatus, undefined); // Don't change escrow status when only changing payment status
      setPaymentStatus(newPaymentStatus);

      toast({
        title: "Payment status updated",
        description: `Payment status has been changed to ${newPaymentStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEscrowStatusChange = async (newEscrowStatus: string) => {
    try {
      setUpdating(true);
      await onStatusUpdate(order.id, status, undefined, newEscrowStatus); // Don't change order/payment status when only changing escrow status
      setEscrowStatus(newEscrowStatus);

      toast({
        title: "Escrow status updated",
        description: `Escrow status has been changed to ${newEscrowStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update escrow status.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'paid': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'processing': return "bg-purple-100 text-purple-800 border-purple-200";
      case 'shipped': return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case 'delivered': return "bg-green-100 text-green-800 border-green-200";
      case 'cancelled': return "bg-red-100 text-red-800 border-red-200";
      case 'held': return "bg-orange-100 text-orange-800 border-orange-200";
      case 'released': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'refunded': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Button>
        <div className="flex gap-2">
          <Badge className={getStatusColor(paymentStatus)}>
            Payment: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </Badge>
          <Badge className={getStatusColor(status)}>
            Order: {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <Badge className={getStatusColor(escrowStatus)}>
            Escrow: {escrowStatus.charAt(0).toUpperCase() + escrowStatus.slice(1)}
          </Badge>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6 dark:text-white">Order #{order.id.slice(0, 8)}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-1 dark:text-white">Customer Information</h3>
              <p className="dark:text-white">{order.customer_name}</p>
              <p className="text-gray-600 dark:text-gray-300">{order.customer_email}</p>
              <p className="text-gray-600 dark:text-gray-300">{order.customer_phone}</p>
              
              {/* Social Media Source Badge */}
              <div className="mt-3">
                <div className="flex items-center">
                  <Share2 size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Source:</span>
                </div>
                <Badge 
                  className={`mt-1 ${getSocialMediaColor(order.social_media_source)}`}
                  variant="outline"
                >
                  {formatSocialMediaSource(order.social_media_source)}
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-1 dark:text-white">Order Date</h3>
              <p className="dark:text-white">{new Date(order.created_at).toLocaleDateString()}</p>
              <p className="text-gray-600 dark:text-gray-300">
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
              {order.payment_reference && (
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Ref: {order.payment_reference}
                </p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-1">Status Management</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Status</p>
                  <div className="flex items-center gap-3">
                    <Select
                      value={status}
                      onValueChange={handleStatusChange}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-full md:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                  <div className="flex items-center gap-3">
                    <Select
                      value={paymentStatus}
                      onValueChange={handlePaymentStatusChange}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-full md:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Escrow Status</p>
                  <div className="flex items-center gap-3">
                    <Select
                      value={escrowStatus}
                      onValueChange={handleEscrowStatusChange}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-full md:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="held">Held</SelectItem>
                        <SelectItem value="released">Released</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Button
                className="mt-3 w-full"
                size="sm"
                onClick={() => {
                  window.open(`/order-tracking/${order.id}`, "_blank");
                }}
              >
                View Tracking Page
              </Button>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h3 className="font-semibold mb-4">Order Items</h3>
          
          {loading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-tonstores-green" />
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 py-3 border-b dark:border-gray-700 last:border-0"
                >
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    {item.product?.image_url ? (
                      <img
                        src={getStorageUrl(item.product.image_url)}
                        alt={item.product?.name || "Product"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = imageDefaults.placeholderImage;
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="font-medium dark:text-white">{item.product?.name || "Product"}</h4>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-600 dark:text-gray-300">
                        {item.quantity} x ₦{(item.price_at_purchase / 100).toFixed(2)}
                      </span>
                      <span className="font-semibold dark:text-white">
                        ₦{((item.quantity * item.price_at_purchase) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-4 font-bold text-lg">
                <span className="dark:text-white">Total</span>
                <span className="dark:text-white">
                  ₦{(order.total_amount / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
