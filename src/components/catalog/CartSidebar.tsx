import { ShoppingCart, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStorageUrl } from "@/utils/imageHelpers";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image_urls?: string[];
  quantity: number;
}

interface Cart {
  items: CartItem[];
  isEmpty: boolean;
  total: number;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onProceedToCheckout: () => void;
}

const CartSidebar = ({ 
  isOpen, 
  onClose, 
  cart, 
  onProceedToCheckout 
}: CartSidebarProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
        onClick={onClose}
      ></div>
      <div
        className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl transform z-50 transition-transform duration-300 ease-in-out"
      >
        <div className="h-full flex flex-col p-5">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-lg font-bold">Your Cart ({cart.items.length})</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </Button>
          </div>

          {cart.isEmpty ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
              <div className="bg-Tonstores-lightgreen p-4 rounded-full mb-4">
                <ShoppingCart size={40} className="text-Tonstores-green mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">
                Start adding some products to your cart
              </p>
              <Button
                variant="outline"
                className="border-Tonstores-green text-Tonstores-green hover:bg-Tonstores-lightgreen"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto space-y-4 py-2">
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <img
                      src={item.image_urls?.[0] ? getStorageUrl(item.image_urls[0]) : (item.image_url ? getStorageUrl(item.image_url) : "/placeholder.svg")}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg mr-3"
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center border rounded">
                          <button
                            className="p-1 text-gray-600 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              cart.updateQuantity(item.id, item.quantity - 1);
                            }}
                            type="button"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-2 py-1 min-w-[40px] text-center">{item.quantity}</span>
                          <button
                            className="p-1 text-gray-600 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              cart.updateQuantity(item.id, item.quantity + 1);
                            }}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-medium text-sm">
                          ₦{((item.price * item.quantity) / 100).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-0 w-8 h-8 rounded-full hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        cart.removeItem(item.id);
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-auto">
                <div className="flex justify-between text-base font-semibold mb-2">
                  <span>Total:</span>
                  <span>₦{(cart.total / 100).toLocaleString()}</span>
                </div>

                <Button
                  className="w-full bg-Tonstores-green hover:bg-Tonstores-darkgreen py-2.5 flex items-center justify-center"
                  onClick={onProceedToCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;