import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Loader2, Search, Filter, AlertCircle, Share2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@/hooks/useOrders";
import OrderDetails from "@/components/orders/OrderDetails";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentStatusService } from "@/services/PaymentStatusService";

const OrderManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [escrowStatusFilter, setEscrowStatusFilter] = useState("all");
  const [socialMediaFilter, setSocialMediaFilter] = useState("all");
  
  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get user's catalogs
        const { data: catalogs, error: catalogError } = await supabase
          .from("catalogs")
          .select("id")
          .eq("user_id", user.id);
        
        if (catalogError) throw catalogError;
        
        if (!catalogs || catalogs.length === 0) {
          setOrders([]);
          setFilteredOrders([]);
          setLoading(false);
          return;
        }
        
        const catalogIds = catalogs.map(catalog => catalog.id);
        
        // Then get all orders for these catalogs
        const { data, error: orderError } = await supabase
          .from("orders")
          .select(`
            id,
            customer_name,
            customer_email,
            customer_phone,
            total_amount,
            status,
            payment_status,
            escrow_status,
            release_date,
            created_at,
            payment_reference,
            catalog_id,
            social_media_source,
            catalogs (
              name,
              slug
            )
          `)
          .in("catalog_id", catalogIds)
          .order("created_at", { ascending: false });
        
        if (orderError) throw orderError;
        
        const formattedOrders = data?.map(order => ({
          ...order,
          catalogs: order.catalogs?.[0] || { name: "", slug: "" },
          user_id: user.id
        })) as Order[] || [];
        
        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        setError(error.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  useEffect(() => {
    // Apply filters when searchQuery, statusFilter, paymentStatusFilter, or escrowStatusFilter changes
    let result = orders;

    // Apply status filter for order status (excluding escrow statuses)
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply payment status filter
    if (paymentStatusFilter !== "all") {
      result = result.filter(order => order.payment_status === paymentStatusFilter);
    }

    // Apply escrow status filter
    if (escrowStatusFilter !== "all") {
      result = result.filter(order => order.escrow_status === escrowStatusFilter);
    }

    // Apply social media filter
    if (socialMediaFilter !== "all") {
      if (socialMediaFilter === "none") {
        result = result.filter(order => !order.social_media_source);
      } else {
        result = result.filter(order => order.social_media_source === socialMediaFilter);
      }
    }

    // Apply search filter (case insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_email.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter, paymentStatusFilter, escrowStatusFilter, socialMediaFilter]);
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };
  
  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };
  
  const handleStatusUpdate = async (orderId: string, status: string, paymentStatus?: string, escrowStatus?: string) => {
    try {
      // First update the order status using PaymentStatusService
      const success = await PaymentStatusService.updateOrderStatusClient(
        orderId,
        status as any, // Type assertion as we're dealing with string values
        paymentStatus as any, // Type assertion
        undefined, // reference
        escrowStatus as any // Type assertion
      );

      if (!success) {
        throw new Error("Failed to update order status");
      }

      // Update the local state
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
            ...(paymentStatus ? { payment_status: paymentStatus } : {}),
            ...(escrowStatus ? { escrow_status: escrowStatus } : {})
          };
        }
        return order;
      });

      setOrders(updatedOrders);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };
  
  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "held":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "released":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "refunded":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Format social media source to display name
  const formatSocialMediaSource = (source: string | null | undefined): string => {
    if (!source) return "Direct / Other";
    
    // Capitalize first letter
    return source.charAt(0).toUpperCase() + source.slice(1);
  };

  // Get badge color for social media
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
  
  if (selectedOrder) {
  return (
          <OrderDetails 
            order={selectedOrder} 
            onClose={handleCloseOrderDetails}
            onStatusUpdate={handleStatusUpdate}
          />
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-tonstores-green" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
            </Alert>
        <Button 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Order Management</h1>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                    <Input
            placeholder="Search by customer name, email, or order ID" 
            className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <div className="w-full sm:w-auto">
                      <Select 
                        value={statusFilter} 
                        onValueChange={setStatusFilter}
                      >
              <SelectTrigger className="w-full">
                          <SelectValue placeholder="Order Status" />
                        </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
          <div className="w-full sm:w-auto">
                      <Select
                        value={paymentStatusFilter}
                        onValueChange={setPaymentStatusFilter}
                      >
              <SelectTrigger className="w-full">
                          <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select
              value={escrowStatusFilter}
              onValueChange={setEscrowStatusFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escrow Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Escrow</SelectItem>
                <SelectItem value="held">Held</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select
              value={socialMediaFilter}
              onValueChange={setSocialMediaFilter}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Source</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="none">Direct / Other</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
            
      <Card>
              <CardContent className="p-0">
          {filteredOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                              {order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                        <div className="font-medium dark:text-white">{order.customer_name}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{order.customer_email}</div>
                            </TableCell>
                      <TableCell>
                              {new Date(order.created_at).toLocaleDateString()}
                            </TableCell>
                      <TableCell>
                              ₦{(order.total_amount / 100).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </TableCell>
                            <TableCell>
                        <div className="flex flex-col gap-1">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                          {order.payment_status && (
                            <Badge className={getStatusColor(order.payment_status)}>
                              Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </Badge>
                          )}
                          {order.escrow_status && (
                            <Badge className={getStatusColor(order.escrow_status)}>
                              Escrow: {order.escrow_status.charAt(0).toUpperCase() + order.escrow_status.slice(1)}
                            </Badge>
                          )}
                        </div>
                            </TableCell>
                            <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getSocialMediaColor(order.social_media_source)}
                        >
                          {formatSocialMediaSource(order.social_media_source)}
                              </Badge>
                            </TableCell>
                      <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                <Filter className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium dark:text-white">No orders found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-1">
                {orders.length > 0 
                  ? "Try changing your filters or search terms."
                  : "You don't have any orders yet."}
              </p>
              {orders.length > 0 && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPaymentStatusFilter("all");
                    setSocialMediaFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              )}
                  </div>
                )}
              </CardContent>
            </Card>
    </div>
  );
};

export default OrderManagement;
