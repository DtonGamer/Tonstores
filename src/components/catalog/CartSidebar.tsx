import { ShoppingCart, X, ArrowRight, Minus, Plus } from "lucide-react";
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

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

const CartSidebar = ({ isOpen, onClose, cart, onProceedToCheckout }: CartSidebarProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <aside className="fixed inset-y-0 right-0 h-dvh w-full max-w-sm bg-background border-l border-border z-50 flex flex-col">
        <div className="flex justify-between items-center px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 border-b border-border">
          <h2 className="text-lg font-extrabold">Your cart ({cart.items.length})</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" aria-label="Close cart">
            <X size={20} />
          </Button>
        </div>

        {cart.isEmpty ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center px-6">
            <div className="bg-accent p-4 rounded-full mb-4">
              <ShoppingCart size={36} className="text-Tonstores-green" />
            </div>
            <h3 className="text-lg font-bold mb-1">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add something you like and it will show up here.</p>
            <Button variant="outline" className="border-2 border-Tonstores-green text-Tonstores-green font-bold" onClick={onClose}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto px-5 py-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-4 border-b border-border">
                  <img
                    src={item.image_urls?.[0] ? getStorageUrl(item.image_urls[0]) : (item.image_url ? getStorageUrl(item.image_url) : "/placeholder.svg")}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl bg-muted flex-none"
                  />
                  <div className="flex-grow min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                    <p className="text-sm font-bold text-Tonstores-green">{naira(item.price * item.quantity)}</p>
                    <div className="inline-flex items-center border border-border rounded-lg mt-1">
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center disabled:opacity-40"
                        onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-[32px] text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center"
                        onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full flex-none" onClick={() => cart.removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex justify-between text-base font-extrabold mb-3">
                <span>Total</span>
                <span>{naira(cart.total)}</span>
              </div>
              <Button className="w-full h-12 text-base font-bold bg-Tonstores-green hover:bg-Tonstores-greendark text-white" onClick={onProceedToCheckout}>
                Proceed to checkout
                <ArrowRight className="ml-2" size={18} />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">You pay the seller by bank transfer.</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;
