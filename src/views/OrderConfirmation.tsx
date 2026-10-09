'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from '@/components/Link';
import { Package, Truck, ArrowRight, Printer, AlertCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { api } from '@/api/client';
import { OrderData } from '@/types';
import { EASE } from '@/lib/motion';

export default function OrderConfirmation({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.entities.Orders.get(id)
      .then((data) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-40 pb-32 px-6 max-w-2xl mx-auto text-center space-y-4 animate-pulse">
        <div className="w-20 h-20 bg-muted/60 rounded-full mx-auto" />
        <div className="h-8 w-48 bg-muted rounded mx-auto" />
        <div className="h-4 w-72 bg-muted/60 rounded mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <div className="pt-40 pb-32 px-6 max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-heading text-2xl text-foreground mb-2">Order Not Found</h1>
          <p className="text-xs text-muted-foreground mb-8">
            We could not locate this order reference. It may have been completed in a private browsing session.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center min-h-[46px] px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-colors"
          >
            Return to Pro Shop
          </Link>
        </div>
      </PageTransition>
    );
  }

  const subtotal = order.subtotal || 0;
  const discount = order.discount_amount || 0;
  const shipping = order.delivery_cost ?? 15;
  const tax = order.tax_amount || (subtotal - discount) * 0.08;
  const grandTotal = order.total || subtotal - discount + shipping + tax;

  return (
    <PageTransition>
      <div className="pt-32 md:pt-40 pb-32 max-w-3xl mx-auto px-6">
        {/* Animated Checkmark Draw-in */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-primary"
              viewBox="0 0 52 52"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M14 27 L22 35 L38 17"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.75, ease: EASE, delay: 0.15 }}
              />
            </svg>
          </div>

          <span className="text-[0.68rem] uppercase tracking-ultra text-primary font-mono font-medium">
            Order Confirmed
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mt-1">
            Thank you, {order.customer_name}
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
            Your athletic gear has been routed to our fulfillment facility. A receipt and digital tracking dispatch has been emailed to <span className="text-foreground font-medium">{order.email}</span>.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-card border border-border/80 divide-y divide-border/60 shadow-xl">
          {/* Header Bar */}
          <div className="p-6 flex flex-wrap items-center justify-between gap-4 bg-secondary/20">
            <div>
              <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-mono">
                Order Reference
              </span>
              <p className="font-mono text-base text-foreground font-bold">
                #{order.order_number || order.id}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-mono text-xs uppercase tracking-wider font-semibold">
                <Package className="w-3.5 h-3.5" />
                <span>Status: {order.status || 'Processing'}</span>
              </span>
            </div>
          </div>

          {/* Delivery Timeline info */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Estimated Delivery Arrival</p>
                <p className="text-muted-foreground">
                  {order.estimated_delivery ? order.estimated_delivery : 'Within 2 to 3 business days'} · Insured Signature Courier
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto min-h-[36px]"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>

          {/* Purchased Items List */}
          <div className="p-6 space-y-4">
            <h3 className="text-[0.68rem] uppercase tracking-ultra text-primary font-mono">
              Items Purchased ({order.items?.length || 0})
            </h3>
            <div className="divide-y divide-border/40">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-16 bg-secondary/40 shrink-0 border border-border/60 overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm text-foreground line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-[0.7rem] text-muted-foreground mt-0.5 font-mono">
                        {[item.selectedSize, item.selectedFlavor].filter(Boolean).join(' · ')} · Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    ${item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Destination */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <p className="text-muted-foreground uppercase text-[0.65rem] tracking-wider mb-1">
                Destination Address
              </p>
              <p className="text-foreground font-medium">{order.customer_name}</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                {order.shipping_address}
                {order.shipping_city ? `, ${order.shipping_city}` : ''}
                {order.shipping_postal ? ` ${order.shipping_postal}` : ''}
              </p>
              {order.phone && <p className="text-muted-foreground mt-0.5 font-mono">{order.phone}</p>}
            </div>

            <div>
              <p className="text-muted-foreground uppercase text-[0.65rem] tracking-wider mb-1">
                Courier & Billing
              </p>
              <p className="text-foreground font-medium">
                {order.delivery_method ? `${order.delivery_method} Delivery` : 'Standard Delivery'}
              </p>
              <p className="text-muted-foreground mt-0.5">
                Authorized via Demo Checkout · Card ending in 4242
              </p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-6 bg-secondary/15 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>Discount Applied ({order.promo_code || 'Promo'})</span>
                <span className="font-mono">-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="font-mono text-foreground">
                {shipping === 0 ? 'Complimentary (Free)' : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Sales Tax (8%)</span>
              <span className="font-mono text-foreground">${tax.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-border/60 flex justify-between items-baseline text-base font-semibold text-foreground">
              <span>Total Paid</span>
              <span className="font-mono text-xl text-primary font-bold">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Action */}
        <div className="mt-8 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-all gap-2 group shadow-md"
          >
            <span>Continue Shopping in The Pro Shop</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}

