
import { useState, useEffect } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  image_urls?: string[] | null;
};

export const useCart = (catalogId: string) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  
  // Load cart from localStorage if exists
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${catalogId}`);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse saved cart", error);
        localStorage.removeItem(`cart-${catalogId}`);
      }
    }
  }, [catalogId]);
  
  // Update total whenever items change
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
    
    // Save to localStorage
    localStorage.setItem(`cart-${catalogId}`, JSON.stringify(items));
  }, [items, catalogId]);
  
  const addItem = (product: { id: string; name: string; price: number; image_url?: string | null; image_urls?: string[] | null }) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Item exists, increase quantity
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // New item, add to cart
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };
  
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(`cart-${catalogId}`);
  };
  
  return {
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isEmpty: items.length === 0
  };
};
