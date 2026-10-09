'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { api } from '@/api/client';
import { EASE } from '@/lib/motion';

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'member_charge',
  });

  const drawerRef = useRef<HTMLDivElement>(null);

  // Reset checkout step when closed
  useEffect(() => {
    if (!cartOpen) {
      setTimeout(() => {
        setCheckoutStep('cart');
        setError(null);
      }, 300);
    }
  }, [cartOpen]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!cartOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setCartOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cartOpen, setCartOpen]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address) {
      setError('Please fill in your name, email, and shipping address.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const order = await api.entities.Orders.create({
        customer_name: form.name,
        email: form.email,
        phone: form.phone,
        shipping_address: form.address,
        items: cart,
        subtotal,
      });

      setOrderId(order.id || `ORD-${Date.now().toString().slice(-6)}`);
      clearCart();
      setCheckoutStep('success');
    } catch (err: any) {
      setError(err?.message || 'Failed to complete order. Please try again.');
    } finally {
      setLoading(false);
    }
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
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6">
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: EASE }}
              role="dialog"
              aria-modal="true"
              aria-label="Shopping Cart"
              className="w-screen max-w-md bg-card border-l border-border/80 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="font-heading text-lg tracking-wider text-foreground">
                    {checkoutStep === 'cart' && `Your Bag (${totalItems})`}
                    {checkoutStep === 'checkout' && 'Checkout'}
                    {checkoutStep === 'success' && 'Order Confirmed'}
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

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {checkoutStep === 'cart' && (
                  <>
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground mb-4">
                          <ShoppingBag className="w-7 h-7" />
                        </div>
                        <h3 className="font-heading text-lg mb-2">Your shopping bag is empty</h3>
                        <p className="text-xs text-muted-foreground max-w-xs mb-6">
                          Explore our collection of premium apparel, certified supplements, and studio-grade training equipment.
                        </p>
                        <button
                          onClick={() => setCartOpen(false)}
                          className="px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 transition-colors"
                        >
                          Discover The Shop
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex gap-4 pb-5 border-b border-border/40"
                          >
                            {/* Product Thumbnail */}
                            <div className="relative w-20 h-24 bg-secondary/40 shrink-0 overflow-hidden border border-border/60">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-heading text-sm text-foreground line-clamp-1">
                                    {item.product.name}
                                  </h4>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    aria-label={`Remove ${item.product.name}`}
                                    className="text-muted-foreground hover:text-destructive p-1 min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                {(item.selectedSize || item.selectedFlavor) && (
                                  <p className="text-[0.75rem] text-primary/90 mt-0.5">
                                    {[item.selectedSize, item.selectedFlavor].filter(Boolean).join(' · ')}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  ${item.product.price} each
                                </p>
                              </div>

                              {/* Quantity and Line Total */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center border border-border/80 bg-background/50 rounded-sm">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    aria-label="Decrease quantity"
                                    className="p-1.5 text-muted-foreground hover:text-foreground min-h-[34px] min-w-[34px] flex items-center justify-center transition-colors"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-2.5 text-xs font-mono font-medium min-w-[24px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    aria-label="Increase quantity"
                                    className="p-1.5 text-muted-foreground hover:text-foreground min-h-[34px] min-w-[34px] flex items-center justify-center transition-colors"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                  ${item.product.price * item.quantity}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {checkoutStep === 'checkout' && (
                  <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@apexfitness.com"
                        className="w-full px-3.5 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+63 917 123 4567"
                        className="w-full px-3.5 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Delivery Address *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Bonifacio Global City, Taguig, Metro Manila"
                        className="w-full px-3.5 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Payment Method
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border border-primary/50 bg-primary/5 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value="member_charge"
                            checked={form.paymentMethod === 'member_charge'}
                            onChange={() => setForm({ ...form, paymentMethod: 'member_charge' })}
                            className="text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="text-xs font-medium text-foreground">Charge to Apex Account</p>
                            <p className="text-[0.7rem] text-muted-foreground">Billed on your next membership cycle</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-border/80 bg-background/50 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value="card_on_file"
                            checked={form.paymentMethod === 'card_on_file'}
                            onChange={() => setForm({ ...form, paymentMethod: 'card_on_file' })}
                            className="text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="text-xs font-medium text-foreground">Credit Card on File (Mock)</p>
                            <p className="text-[0.7rem] text-muted-foreground">Instant zero-touch payment</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </form>
                )}

                {checkoutStep === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-5">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="font-heading text-2xl mb-2 text-foreground">Order Placed</h3>
                    <p className="text-xs uppercase tracking-widest text-primary font-mono mb-4">
                      #{orderId}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-8">
                      Thank you for your order. A digital invoice and delivery tracking notification have been dispatched to your email.
                    </p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-full py-3.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 transition-colors"
                    >
                      Return to Store
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Footer Summary */}
              {checkoutStep !== 'success' && cart.length > 0 && (
                <div className="border-t border-border/60 p-6 bg-card/60 backdrop-blur-sm space-y-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-mono text-foreground">${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Express Shipping</span>
                      <span className="text-primary uppercase tracking-wider text-[0.65rem] font-semibold">
                        Complimentary
                      </span>
                    </div>
                    <div className="flex justify-between text-foreground font-semibold pt-2 border-t border-border/40 text-sm">
                      <span>Estimated Total</span>
                      <span className="font-mono text-primary">${subtotal}</span>
                    </div>
                  </div>

                  {checkoutStep === 'cart' ? (
                    <button
                      onClick={() => setCheckoutStep('checkout')}
                      className="w-full min-h-[46px] bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        disabled={loading}
                        className="px-4 py-3 border border-border text-foreground text-xs uppercase tracking-wider hover:bg-secondary/50 transition-colors min-h-[46px]"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        form="checkout-form"
                        disabled={loading}
                        className="flex-1 min-h-[46px] bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>Place Order · ${subtotal}</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

