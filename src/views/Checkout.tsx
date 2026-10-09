'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from '@/components/Link';
import {
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Tag,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useCart } from '@/lib/CartContext';
import { api } from '@/api/client';
import { EASE } from '@/lib/motion';

export default function Checkout() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    clearCart,
    isFreeShipping,
    appliedPromo,
    applyPromo,
    removePromo,
  } = useCart();

  // Current Step: 1 = Details, 2 = Shipping, 3 = Review & Pay
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [shipping, setShipping] = useState({
    address: '',
    city: '',
    district: 'Metro Manila',
    postalCode: '',
    deliveryMethod: 'standard' as 'standard' | 'express',
  });

  const [payment, setPayment] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardName: '',
    expiry: '12/28',
    cvc: '888',
  });

  const [promoInput, setPromoInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Delivery costs calculation
  const standardCost = isFreeShipping ? 0 : 15;
  const expressCost = isFreeShipping ? 10 : 25;
  const deliveryCost = shipping.deliveryMethod === 'express' ? expressCost : standardCost;

  // Discount calculation
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    return (subtotal * appliedPromo.discountPercent) / 100;
  }, [subtotal, appliedPromo]);

  // Tax flat 8% on discounted subtotal
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * 0.08;

  // Grand Total
  const finalTotal = taxableAmount + deliveryCost + taxAmount;

  // Step 1 Validation
  const validateDetails = () => {
    const errs: Record<string, string> = {};
    if (!details.name.trim()) errs.name = 'Full name is required';
    if (!details.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(details.email.trim())) {
      errs.email = 'Please provide a valid email';
    }
    if (!details.phone.trim()) {
      errs.phone = 'Phone number is required for dispatch updates';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateShipping = () => {
    const errs: Record<string, string> = {};
    if (!shipping.address.trim()) errs.address = 'Street address is required';
    if (!shipping.city.trim()) errs.city = 'City or municipality is required';
    if (!shipping.postalCode.trim()) errs.postalCode = 'Postal code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetails()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromo(promoInput);
    if (res.success) {
      setPromoInput('');
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!payment.cardName.trim()) {
      setPayment((prev) => ({ ...prev, cardName: details.name }));
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const order = await api.entities.Orders.create({
        customer_name: details.name,
        email: details.email,
        phone: details.phone,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_postal: shipping.postalCode,
        shipping_district: shipping.district,
        delivery_method: shipping.deliveryMethod === 'express' ? 'Express' : 'Standard',
        delivery_cost: deliveryCost,
        promo_code: appliedPromo?.code,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        subtotal,
        total: finalTotal,
        items: cart,
      });

      // Clear cart
      clearCart();

      // Navigate to order confirmation
      router.push(`/order/${order.id || order.order_number}`);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to place order. Please review your cart.');
      setIsSubmitting(false);
    }
  };

  // If cart is empty
  if (cart.length === 0 && !isSubmitting) {
    return (
      <PageTransition>
        <div className="pt-40 pb-32 px-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="font-heading text-2xl text-foreground mb-2">Your Bag is Empty</h1>
          <p className="text-xs text-muted-foreground mb-8">
            Please add items from the Pro Shop before proceeding to checkout.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center min-h-[46px] px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-colors"
          >
            Explore The Shop
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="pt-32 md:pt-40 pb-32 max-w-7xl mx-auto px-6 md:px-12">
        {/* Mobile Collapsible Order Summary */}
        <div className="lg:hidden mb-8 border border-border/80 bg-card">
          <button
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full flex items-center justify-between p-4 min-h-[48px] text-xs font-medium text-foreground"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>{mobileSummaryOpen ? 'Hide' : 'Show'} order summary ({cart.length} items)</span>
              {mobileSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <span className="font-mono text-primary font-semibold text-sm">
              ${finalTotal.toFixed(2)}
            </span>
          </button>

          <AnimatePresence>
            {mobileSummaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border/60 p-5 space-y-4 overflow-hidden"
              >
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-secondary/40 shrink-0 border border-border/60 overflow-hidden">
                          <Image src={item.product.image} alt={item.product.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{item.product.name}</p>
                          <p className="text-[0.7rem] text-muted-foreground font-mono">
                            Qty: {item.quantity} {item.selectedSize ? `· ${item.selectedSize}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-medium">${item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/40 pt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount ({appliedPromo?.code})</span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-mono text-foreground">
                      {deliveryCost === 0 ? 'Free' : `$${deliveryCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-mono text-foreground">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground font-semibold text-sm pt-2 border-t border-border/40">
                    <span>Total Due</span>
                    <span className="font-mono text-primary">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3-Step Animated Progress Indicator */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Background connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-border/80 z-0" />
            {/* Active connection line */}
            <motion.div
              className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-primary z-0"
              initial={false}
              animate={{
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
              }}
              transition={{ duration: 0.45, ease: EASE }}
            />

            {[
              { num: 1, label: 'Details' },
              { num: 2, label: 'Shipping' },
              { num: 3, label: 'Review & Pay' },
            ].map((st) => {
              const isPassed = currentStep > st.num;
              const isCurrent = currentStep === st.num;
              return (
                <div key={st.num} className="relative z-10 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (st.num < currentStep) setCurrentStep(st.num as any);
                    }}
                    disabled={st.num > currentStep}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all duration-300 border ${
                      isPassed
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isCurrent
                        ? 'bg-card border-primary text-primary ring-4 ring-primary/20'
                        : 'bg-card border-border text-muted-foreground'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : st.num}
                  </button>
                  <span
                    className={`mt-2 text-[0.65rem] uppercase tracking-ultra font-mono transition-colors ${
                      isCurrent || isPassed ? 'text-primary font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Form Steps on Left, Order Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Form Area */}
          <div className="lg:col-span-7">
            {submitError && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-none flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">Order Issue</p>
                  <p>{submitError}</p>
                </div>
              </div>
            )}

            {/* STEP 1: Details */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="bg-card border border-border/80 p-8 sm:p-10"
              >
                <div className="mb-8">
                  <span className="text-[0.65rem] uppercase tracking-ultra text-primary font-mono">
                    Step 1 of 3
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl text-foreground mt-1">
                    Contact Details
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter recipient info for dispatch notifications and shipment tracking.
                  </p>
                </div>

                <form onSubmit={handleNextToShipping} className="space-y-5">
                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      value={details.name}
                      onChange={(e) => {
                        setDetails({ ...details, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="Sebastian Sterling"
                      className={`w-full px-4 py-3 bg-background border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px] ${
                        errors.name ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={details.email}
                      onChange={(e) => {
                        setDetails({ ...details, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="sterling@apex.club"
                      className={`w-full px-4 py-3 bg-background border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px] ${
                        errors.email ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={details.phone}
                      onChange={(e) => {
                        setDetails({ ...details, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="+63 917 800 1234"
                      className={`w-full px-4 py-3 bg-background border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px] ${
                        errors.phone ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full min-h-[48px] bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-md"
                    >
                      <span>Continue to Shipping</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: Shipping */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="bg-card border border-border/80 p-8 sm:p-10"
              >
                <div className="mb-8">
                  <span className="text-[0.65rem] uppercase tracking-ultra text-primary font-mono">
                    Step 2 of 3
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl text-foreground mt-1">
                    Shipping & Delivery
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select your delivery destination and courier tier.
                  </p>
                </div>

                <form onSubmit={handleNextToReview} className="space-y-5">
                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                      Street Address & Unit *
                    </label>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={(e) => {
                        setShipping({ ...shipping, address: e.target.value });
                        if (errors.address) setErrors({ ...errors, address: '' });
                      }}
                      placeholder="One Serendra, 11th Avenue, Bonifacio Global City"
                      className={`w-full px-4 py-3 bg-background border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px] ${
                        errors.address ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                        City / Municipality *
                      </label>
                      <input
                        type="text"
                        value={shipping.city}
                        onChange={(e) => {
                          setShipping({ ...shipping, city: e.target.value });
                          if (errors.city) setErrors({ ...errors, city: '' });
                        }}
                        placeholder="Taguig"
                        className={`w-full px-4 py-3 bg-background border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px] ${
                          errors.city ? 'border-destructive' : 'border-border'
                        }`}
                      />
                      {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={shipping.postalCode}
                        onChange={(e) => {
                          setShipping({ ...shipping, postalCode: e.target.value });
                          if (errors.postalCode) setErrors({ ...errors, postalCode: '' });
                        }}
                        placeholder="1634"
                        className={`w-full px-4 py-3 bg-background border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px] ${
                          errors.postalCode ? 'border-destructive' : 'border-border'
                        }`}
                      />
                      {errors.postalCode && <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                      Province / Region
                    </label>
                    <input
                      type="text"
                      value={shipping.district}
                      onChange={(e) => setShipping({ ...shipping, district: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                    />
                  </div>

                  {/* Delivery Options */}
                  <div className="pt-4">
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-3 font-medium">
                      Select Delivery Method
                    </label>
                    <div className="space-y-3">
                      {/* Standard */}
                      <label
                        className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                          shipping.deliveryMethod === 'standard'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background/50 hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="delivery"
                            checked={shipping.deliveryMethod === 'standard'}
                            onChange={() => setShipping({ ...shipping, deliveryMethod: 'standard' })}
                            className="text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="text-xs font-semibold text-foreground">Standard Ground Delivery</p>
                            <p className="text-[0.7rem] text-muted-foreground">3 to 5 business days</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {standardCost === 0 ? (
                            <span className="text-primary uppercase tracking-wider">Free</span>
                          ) : (
                            `$${standardCost}`
                          )}
                        </span>
                      </label>

                      {/* Express */}
                      <label
                        className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                          shipping.deliveryMethod === 'express'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background/50 hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="delivery"
                            checked={shipping.deliveryMethod === 'express'}
                            onChange={() => setShipping({ ...shipping, deliveryMethod: 'express' })}
                            className="text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="text-xs font-semibold text-foreground">Express Priority Dispatch</p>
                            <p className="text-[0.7rem] text-muted-foreground">1 to 2 business days</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          ${expressCost}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 border border-border text-foreground text-xs uppercase tracking-wider font-medium hover:border-primary transition-colors min-h-[48px]"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 min-h-[48px] bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-md"
                    >
                      <span>Continue to Review & Pay</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 3: Review & Pay */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="bg-card border border-border/80 p-8 sm:p-10 space-y-8"
              >
                <div>
                  <span className="text-[0.65rem] uppercase tracking-ultra text-primary font-mono">
                    Step 3 of 3
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl text-foreground mt-1">
                    Review & Payment
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Review your order details and authorize checkout.
                  </p>
                </div>

                {/* Recap of Details & Shipping */}
                <div className="p-4 bg-secondary/30 border border-border/60 divide-y divide-border/40 text-xs">
                  <div className="pb-3 flex justify-between items-start">
                    <div>
                      <span className="text-muted-foreground uppercase text-[0.65rem] tracking-wider">
                        Contact
                      </span>
                      <p className="text-foreground font-medium mt-0.5">{details.name} · {details.email}</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-primary hover:underline uppercase text-[0.65rem] tracking-wider font-semibold"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="pt-3 flex justify-between items-start">
                    <div>
                      <span className="text-muted-foreground uppercase text-[0.65rem] tracking-wider">
                        Ship To
                      </span>
                      <p className="text-foreground font-medium mt-0.5">
                        {shipping.address}, {shipping.city}, {shipping.postalCode}
                      </p>
                      <p className="text-muted-foreground text-[0.7rem] mt-0.5">
                        {shipping.deliveryMethod === 'express' ? 'Express Priority' : 'Standard Delivery'} (${deliveryCost})
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-primary hover:underline uppercase text-[0.65rem] tracking-wider font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Promo Code Input Field */}
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                    Promotion or Member Code
                  </label>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/40 text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        <div>
                          <span className="font-mono font-semibold text-primary">{appliedPromo.code}</span>
                          <span className="text-muted-foreground ml-2">({appliedPromo.discountPercent}% off applied)</span>
                        </div>
                      </div>
                      <button
                        onClick={removePromo}
                        aria-label="Remove promo code"
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="e.g. WELCOME10 or APEXVIP"
                        className="flex-1 px-4 py-2.5 bg-background border border-border text-foreground text-sm uppercase font-mono focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2.5 border border-border text-foreground text-xs uppercase tracking-wider font-semibold hover:border-primary hover:text-primary transition-colors min-h-[44px]"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  <p className="text-[0.65rem] text-muted-foreground mt-1.5 font-mono">
                    Try seeded codes: WELCOME10 (10% off) or APEXVIP (20% off)
                  </p>
                </div>

                {/* Mock Payment Form */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-[0.7rem] uppercase tracking-wider text-foreground font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      Payment Method
                    </span>
                    <span className="text-[0.65rem] text-primary uppercase font-mono bg-primary/10 border border-primary/25 px-2 py-0.5">
                      Demo Checkout · No Charge
                    </span>
                  </div>

                  <div>
                    <label className="block text-[0.68rem] uppercase tracking-wider text-muted-foreground mb-1">
                      Card Number (Simulated)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={payment.cardNumber}
                      className="w-full px-4 py-3 bg-secondary/40 border border-border text-foreground text-sm font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.68rem] uppercase tracking-wider text-muted-foreground mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        disabled
                        value={payment.expiry}
                        className="w-full px-4 py-3 bg-secondary/40 border border-border text-foreground text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.68rem] uppercase tracking-wider text-muted-foreground mb-1">
                        Security CVC
                      </label>
                      <input
                        type="text"
                        disabled
                        value={payment.cvc}
                        className="w-full px-4 py-3 bg-secondary/40 border border-border text-foreground text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.68rem] uppercase tracking-wider text-muted-foreground mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={payment.cardName || details.name}
                      onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                      placeholder={details.name || 'Sebastian Sterling'}
                      className="w-full px-4 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                    />
                  </div>

                  <div className="p-3 bg-secondary/20 border border-border/60 flex items-center gap-2.5 text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>256-Bit SSL Encrypted Demo Authorization · Instant Order Confirmation</span>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={isSubmitting}
                    className="px-6 py-3.5 border border-border text-foreground text-xs uppercase tracking-wider font-medium hover:border-primary transition-colors min-h-[48px]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="flex-1 min-h-[48px] bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing Order...</span>
                      </>
                    ) : (
                      <span>Place Order · ${finalTotal.toFixed(2)}</span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sticky Order Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28 space-y-6">
            <div className="bg-card border border-border/80 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h3 className="font-heading text-xl text-foreground">Order Summary</h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <div className="relative w-16 h-20 bg-secondary/40 shrink-0 border border-border/60 overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-heading text-sm text-foreground line-clamp-1">
                          {item.product.name}
                        </h4>
                        {(item.selectedSize || item.selectedFlavor) && (
                          <p className="text-[0.68rem] text-primary font-mono mt-0.5">
                            {[item.selectedSize, item.selectedFlavor].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-semibold text-foreground">
                        ${item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping ({shipping.deliveryMethod === 'express' ? 'Express' : 'Standard'})</span>
                  <span className="font-mono text-foreground">
                    {deliveryCost === 0 ? (
                      <span className="text-primary uppercase tracking-wider font-medium">Free</span>
                    ) : (
                      `$${deliveryCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono text-foreground">${taxAmount.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-border/60 flex justify-between items-baseline text-base font-semibold text-foreground">
                  <span>Total</span>
                  <span className="font-mono text-xl text-primary font-bold">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Free Shipping guarantee notice */}
            <div className="p-4 bg-secondary/30 border border-border/60 text-xs text-muted-foreground flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary shrink-0" />
              <span>
                Complimentary insured delivery for orders over $150. Tracked signature service.
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

