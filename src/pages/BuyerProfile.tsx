import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Order } from '@/hooks/useOrders';
import { useOrders } from '@/hooks/useOrders';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function BuyerProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getUserOrders, isLoading } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        // Get current user
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }

        if (!currentUser) {
          toast({
            title: "Not authenticated",
            description: "Please log in to view your profile.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        setUser(currentUser);

        // Fetch user orders
        const userOrders = await getUserOrders();
        setOrders(userOrders);
      } catch (error: any) {
        console.error('Error fetching user or orders:', error);
        toast({
          title: "Error loading profile",
          description: error.message || "Failed to load your profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrders();
  }, [navigate]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Tonstores-green"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-Tonstores-darkblue">Your Profile</h1>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="text-gray-900 dark:text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-gray-900 dark:text-white">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="text-gray-900 dark:text-white">
                  {user?.user_metadata?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                <p className="text-gray-900 dark:text-white">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Tonstores-green"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                <p className="text-gray-500">When you place orders, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">Order #{order.id.substring(0, 8)}</h3>
                        <p className="text-sm text-gray-500">
                          {order.catalogs?.name || 'Catalog Order'} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <Badge className={getStatusBadgeVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{order.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{order.customer_phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{order.customer_address || 'Address not provided'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="font-medium">
                        ₦{(order.total_amount / 100).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/order-tracking/${order.id}`)}
                      >
                        Track Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}