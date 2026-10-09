'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { INITIAL_PRODUCTS } from '@/data/mockData';
import { EASE } from '@/lib/motion';
import { ProductItem } from '@/types';

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    addToCart,
    totalItems,
    subtotal,
    amountToFreeShipping,
    freeShippingProgress,
    isFreeShipping,
  } = useCart();

  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Body scroll lock & Escape key
  useEffect(() => {
    if (!cartOpen) return;
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setCartOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cartOpen, setCartOpen]);

  // "You may also like" recommendations: products not currently in cart
  const recommendations = useMemo(() => {
    const inCartIds = new Set(cart.map((item) => item.product.id));
    return INITIAL_PRODUCTS.filter((p) => !inCartIds.has(p.id) && p.stock > 0).slice(0, 3);
  }, [cart]);

  const handleCheckoutClick = () => {
    setCartOpen(false);
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    setCartOpen(false);
    router.push('/shop');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[70] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Drawer / Bottom sheet */}
          <div className="fixed inset-0 pointer-events-none flex flex-col justify-end md:flex-row md:justify-end">
            <motion.div
              ref={drawerRef}
              initial={isMobile ? { y: '100%' } : { x: '100%' }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: '100%' } : { x: '100%' }}
              transition={{ duration: 0.45, ease: EASE }}
              role="dialog"
              aria-modal="true"
              aria-label="Shopping Bag"
              className="pointer-events-auto w-full md:w-screen md:max-w-md max-h-[90vh] md:max-h-full bg-card border-t md:border-t-0 md:border-l border-border/80 shadow-2xl flex flex-col rounded-t-2xl md:rounded-none overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 md:py-5 border-b border-border/60 shrink-0 bg-card">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="font-heading text-lg tracking-wider text-foreground">
                    Your Selection ({totalItems})
                  </h2>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  aria-label="Close cart drawer"
                  className="p-2 -mr-2 text-foreground/70 hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free-shipping progress bar */}
              <div className="px-6 py-3.5 bg-secondary/30 border-b border-border/50 shrink-0">
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  {isFreeShipping ? (
                    <span className="text-primary font-semibold flex items-center gap-1.5 text-[0.72rem]">
                      <Sparkles className="w-3.5 h-3.5" />
                      Complimentary Express Shipping Unlocked
                    </span>
                  ) : (
                    <span className="text-foreground/80 text-[0.72rem]">
                      Add <span className="font-mono text-primary font-semibold">${amountToFreeShipping.toFixed(0)}</span> for free shipping
                    </span>
                  )}
                  <span className="text-[0.65rem] text-muted-foreground font-mono">
                    {freeShippingProgress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>

              {/* Scrollable Items Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground mb-4">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <h3 className="font-heading text-lg mb-2 text-foreground">Your bag is empty</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mb-8 leading-relaxed">
                      Elevate your performance. Explore signature apparel, clean supplements, and studio gear.
                    </p>
                    <button
                      onClick={handleContinueShopping}
                      className="min-h-[44px] px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex gap-4 pb-4 border-b border-border/40"
                        >
                          {/* Image */}
                          <div className="relative w-20 h-24 bg-secondary/40 shrink-0 overflow-hidden border border-border/60">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-background/10 pointer-events-none" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-heading text-sm text-foreground line-clamp-1">
                                  {item.product.name}
                                </h4>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  aria-label={`Remove ${item.product.name}`}
                                  className="text-muted-foreground hover:text-destructive p-1 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors -mr-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {(item.selectedSize || item.selectedFlavor) && (
                                <p className="text-[0.72rem] text-primary/90 mt-0.5 font-mono">
                                  {[item.selectedSize, item.selectedFlavor].filter(Boolean).join(' · ')}
                                </p>
                              )}

                              <p className="text-xs text-muted-foreground mt-0.5">
                                ${item.product.price} each
                              </p>
                            </div>

                            {/* Stepper + Subtotal */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-border/80 bg-background/60">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  aria-label="Decrease quantity"
                                  className="p-1.5 text-muted-foreground hover:text-foreground min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2.5 text-xs font-mono font-medium min-w-[24px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  aria-label="Increase quantity"
                                  className="p-1.5 text-muted-foreground hover:text-foreground min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <span className="text-sm font-semibold text-foreground font-mono">
                                ${item.product.price * item.quantity}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* "You may also like" row */}
                    {recommendations.length > 0 && (
                      <div className="pt-4 border-t border-border/60">
                        <p className="text-[0.68rem] uppercase tracking-ultra text-primary font-mono mb-3">
                          You may also like
                        </p>
                        <div className="space-y-3">
                          {recommendations.map((rec) => (
                            <div
                              key={rec.id}
                              className="flex items-center justify-between gap-3 p-2.5 bg-secondary/30 border border-border/60 hover:border-border transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 bg-secondary/50 shrink-0 overflow-hidden border border-border/40">
                                  <Image src={rec.image} alt={rec.name} fill sizes="48px" className="object-cover" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-foreground line-clamp-1">{rec.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-mono text-primary font-semibold">${rec.price}</span>
                                    {rec.member_price && (
                                      <span className="text-[0.62rem] text-muted-foreground font-mono">
                                        Member: ${rec.member_price}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => addToCart(rec, 1)}
                                aria-label={`Add ${rec.name}`}
                                className="min-h-[36px] px-3 text-[0.65rem] uppercase tracking-wider font-semibold border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer with Checkout CTA */}
              {cart.length > 0 && (
                <div className="border-t border-border/60 p-6 bg-card shrink-0 space-y-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-mono text-foreground">${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated Shipping</span>
                      <span className="font-mono text-foreground">
                        {isFreeShipping ? (
                          <span className="text-primary font-semibold uppercase text-[0.65rem]">
                            Free
                          </span>
                        ) : (
                          '$15'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-foreground font-semibold pt-2 border-t border-border/40 text-sm">
                      <span>Subtotal</span>
                      <span className="font-mono text-primary">${subtotal}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutClick}
                    className="w-full min-h-[48px] bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-md"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
