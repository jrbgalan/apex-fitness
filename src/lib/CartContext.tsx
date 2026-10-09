'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProductItem, CartItem } from '@/types';
import { toast } from 'sonner';

export const FREE_SHIPPING_THRESHOLD = 150;

export interface PromoCode {
  code: string;
  discountPercent: number; // e.g. 10 for 10%
  description: string;
}

export const SEEDED_PROMO_CODES: Record<string, PromoCode> = {
  WELCOME10: { code: 'WELCOME10', discountPercent: 10, description: '10% Welcome Discount' },
  APEXVIP: { code: 'APEXVIP', discountPercent: 20, description: '20% Apex VIP Privilege' },
};

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
  badgeBounce: boolean;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  freeShippingProgress: number;
  isFreeShipping: boolean;
  appliedPromo: PromoCode | null;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'apex_cart';
const PROMO_STORAGE_KEY = 'apex_applied_promo';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [mounted, setMounted] = useState(false);

  // Sync from localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        setCart([]);
      }
      const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      if (savedPromo) {
        setAppliedPromo(JSON.parse(savedPromo));
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);

    // Cross-tab synchronization
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === PROMO_STORAGE_KEY) {
        loadFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [loadFromStorage]);

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      if (appliedPromo) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch {}
  }, [appliedPromo, mounted]);

  const triggerBadgeBounce = () => {
    setBadgeBounce(true);
    setTimeout(() => setBadgeBounce(false), 600);
  };

  const addToCart = (
    product: ProductItem,
    quantity = 1,
    selectedSize?: string,
    selectedFlavor?: string
  ) => {
    // Out of stock guard
    if (product.stock <= 0) {
      toast.error(`"${product.name}" is currently sold out.`);
      return;
    }

    let clampedQty = quantity;
    setCart((prev) => {
      const itemKey = `${product.id}-${selectedSize || 'default'}-${selectedFlavor || 'default'}`;
      const existingIndex = prev.findIndex((item) => item.id === itemKey);

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const totalNewQty = currentQty + quantity;
        if (totalNewQty > product.stock) {
          clampedQty = Math.max(0, product.stock - currentQty);
          if (clampedQty <= 0) {
            toast.error(`Cannot add more: you already have all available units in your cart.`);
            return prev;
          }
        }
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: currentQty + clampedQty,
        };
        return next;
      }

      if (quantity > product.stock) {
        clampedQty = product.stock;
      }

      return [
        ...prev,
        {
          id: itemKey,
          product,
          quantity: clampedQty,
          selectedSize,
          selectedFlavor,
        },
      ];
    });

    triggerBadgeBounce();

    toast.success(`Added ${product.name} to cart`, {
      description:
        selectedSize || selectedFlavor
          ? `${[selectedSize, selectedFlavor].filter(Boolean).join(' · ')} · Qty: ${clampedQty}`
          : `Qty: ${clampedQty}`,
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
      prev.map((item) => {
        if (item.id === itemId) {
          if (quantity > item.product.stock) {
            toast.error(`Only ${item.product.stock} units available in stock.`);
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const removed = prev.find((item) => item.id === itemId);
      if (removed) {
        toast.info(`Removed ${removed.product.name} from bag.`);
      }
      return prev.filter((item) => item.id !== itemId);
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const applyPromo = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const found = SEEDED_PROMO_CODES[normalized];
    if (found) {
      setAppliedPromo(found);
      toast.success(`Promo code applied!`, {
        description: `${found.description} (${found.discountPercent}% off subtotal)`,
      });
      return { success: true, message: `Applied ${found.discountPercent}% off` };
    }
    toast.error('Invalid promo code. Try WELCOME10 or APEXVIP');
    return { success: false, message: 'Invalid promo code' };
  };

  const removePromo = () => {
    if (appliedPromo) {
      toast.info(`Promo code ${appliedPromo.code} removed.`);
      setAppliedPromo(null);
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

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
        badgeBounce,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountToFreeShipping,
        freeShippingProgress,
        isFreeShipping,
        appliedPromo,
        applyPromo,
        removePromo,
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
