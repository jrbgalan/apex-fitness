'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem, CartItem } from '@/types';
import { toast } from 'sonner';

interface CartContextValue {
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: ProductItem, quantity?: number, selectedSize?: string, selectedFlavor?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'apex_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, mounted]);

  const addToCart = (
    product: ProductItem,
    quantity = 1,
    selectedSize?: string,
    selectedFlavor?: string
  ) => {
    setCart((prev) => {
      const itemKey = `${product.id}-${selectedSize || 'default'}-${selectedFlavor || 'default'}`;
      const existingIndex = prev.findIndex((item) => item.id === itemKey);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      return [
        ...prev,
        {
          id: itemKey,
          product,
          quantity,
          selectedSize,
          selectedFlavor,
        },
      ];
    });

    toast.success(`Added ${product.name} to cart`, {
      description: selectedSize || selectedFlavor ? `${[selectedSize, selectedFlavor].filter(Boolean).join(' · ')} · Qty: ${quantity}` : `Qty: ${quantity}`,
      action: {
        label: 'View Cart',
        onClick: () => setCartOpen(true),
      },
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}

