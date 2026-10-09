'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Package,
  Clock,
  MapPin,
  Mail,
  Phone,
  Eye,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  Printer,
  X,
  CreditCard,
} from 'lucide-react';
import Image from 'next/image';
import { OrderData } from '@/types';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminOrdersProps {
  orders: OrderData[];
  onRefresh: () => void;
}

const STATUS_OPTIONS = ['Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

export default function AdminOrders({ orders, onRefresh }: AdminOrdersProps) {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (selectedStatus !== 'All') {
        if (o.status?.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mNum = o.order_number?.toLowerCase().includes(q);
        const mName = o.customer_name.toLowerCase().includes(q);
        const mEmail = o.email.toLowerCase().includes(q);
        if (!mNum && !mName && !mEmail) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, search]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.entities.Orders.updateStatus(id, newStatus);
      toast.success(`Order status set to "${newStatus}"`);
      if (selectedOrder && (selectedOrder.id === id || selectedOrder.order_number === id)) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      onRefresh();
    } catch {
      toast.error('Failed to update order status.');
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer name, email..."
            className="w-full min-h-[44px] pl-10 pr-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="min-h-[44px] px-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="All" className="bg-[#121212] text-foreground">
            All Order Statuses
          </option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st} className="bg-[#121212] text-foreground">
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="border border-border/70 bg-card/50 overflow-hidden">
        <table className="w-full text-left text-xs font-mono hidden md:table">
          <thead className="border-b border-border/70 bg-muted/20 text-muted-foreground uppercase text-[0.66rem] tracking-wider">
            <tr>
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status Flow</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((o) => (
              <tr key={o.id || o.order_number} className="hover:bg-card/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-primary">
                  {o.order_number}
                </td>

                <td className="py-3.5 px-4">
                  <div className="text-foreground font-medium">{o.customer_name}</div>
                  <div className="text-[0.68rem] text-muted-foreground">{o.email}</div>
                </td>

                <td className="py-3.5 px-4 text-muted-foreground">
                  {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Today'}
                </td>

                <td className="py-3.5 px-4 font-bold text-foreground">
                  ${(o.total || o.subtotal || 0).toFixed(2)}
                </td>

                <td className="py-3.5 px-4">
                  <select
                    value={o.status || 'Processing'}
                    onChange={(e) => o.id && handleUpdateStatus(o.id, e.target.value)}
                    className={cn(
                      'px-2.5 py-1 text-[0.68rem] font-bold border uppercase tracking-wider focus:outline-none cursor-pointer',
                      o.status === 'Delivered'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : o.status === 'Shipped'
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-400'
                        : o.status === 'Cancelled'
                        ? 'bg-red-500/15 border-red-500/40 text-red-400'
                        : 'bg-primary/15 border-primary/40 text-primary'
                    )}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st} className="bg-[#141414] text-foreground font-mono">
                        {st}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 font-mono text-xs"
                    title="View Full Order Invoice"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border/60">
          {filtered.map((o) => (
            <div key={o.id || o.order_number} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary font-mono">{o.order_number}</span>
                <span className="text-foreground font-bold font-mono">
                  ${(o.total || o.subtotal || 0).toFixed(2)}
                </span>
              </div>

              <div>
                <h4 className="font-heading text-sm font-semibold text-foreground">
                  {o.customer_name}
                </h4>
                <p className="text-xs text-muted-foreground font-mono">{o.email}</p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-border/50">
                <select
                  value={o.status || 'Processing'}
                  onChange={(e) => o.id && handleUpdateStatus(o.id, e.target.value)}
                  className={cn(
                    'min-h-[44px] px-2.5 py-1 text-[0.68rem] font-bold border uppercase tracking-wider',
                    o.status === 'Delivered'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : o.status === 'Shipped'
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-400'
                      : 'bg-primary/15 border-primary/40 text-primary'
                  )}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st} className="bg-[#141414] text-foreground font-mono">
                      {st}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setSelectedOrder(o)}
                  className="min-h-[44px] px-3 text-xs font-mono text-primary flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-xl bg-[#141414] border-l border-border/80 h-full p-6 sm:p-8 z-10 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250 font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div>
                <span className="text-[0.65rem] uppercase tracking-ultra text-primary block">
                  Invoice Breakdown
                </span>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Order {selectedOrder.order_number}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Delivery */}
            <div className="p-4 border border-border/60 bg-background/50 flex items-center justify-between">
              <div>
                <span className="text-muted-foreground block text-[0.68rem]">Status Flow</span>
                <span className="font-bold text-primary uppercase tracking-wider text-xs">
                  {selectedOrder.status}
                </span>
              </div>
              {selectedOrder.estimated_delivery && (
                <div className="text-right">
                  <span className="text-muted-foreground block text-[0.68rem]">Est. Delivery</span>
                  <span className="text-foreground font-bold">{selectedOrder.estimated_delivery}</span>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="p-4 border border-border/60 bg-background/50 space-y-2">
              <h4 className="text-[0.7rem] uppercase tracking-wider text-primary font-bold">
                Recipient Details
              </h4>
              <p className="text-foreground font-bold">{selectedOrder.customer_name}</p>
              <p className="text-muted-foreground">{selectedOrder.email}</p>
              {selectedOrder.phone && <p className="text-muted-foreground">{selectedOrder.phone}</p>}
              <p className="text-foreground pt-1 border-t border-border/40 mt-1">
                {selectedOrder.shipping_address}
                {selectedOrder.shipping_city ? `, ${selectedOrder.shipping_city}` : ''}
              </p>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <h4 className="text-[0.7rem] uppercase tracking-wider text-primary font-bold">
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="border border-border/60 divide-y divide-border/50 bg-background/30">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-neutral-900 border border-border/50 shrink-0 overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-foreground font-medium truncate max-w-[200px]">
                          {item.product.name}
                        </div>
                        <div className="text-[0.65rem] text-muted-foreground">
                          Qty: {item.quantity} · ${item.product.price} ea
                          {item.selectedSize ? ` · Size ${item.selectedSize}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-foreground">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 border border-border/60 bg-background/50 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">${selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              {selectedOrder.discount_amount ? (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo Discount ({selectedOrder.promo_code || 'CODE'})</span>
                  <span>-${selectedOrder.discount_amount.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping ({selectedOrder.delivery_method || 'Standard'})</span>
                <span className="text-foreground">
                  {selectedOrder.delivery_cost ? `$${selectedOrder.delivery_cost.toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (8% Metro VAT)</span>
                <span className="text-foreground">${(selectedOrder.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border/60">
                <span>Total Gross</span>
                <span>${(selectedOrder.total || selectedOrder.subtotal || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Print & Close */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="min-h-[44px] px-4 py-2 border border-border text-xs uppercase tracking-wider hover:text-foreground flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="min-h-[44px] px-6 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
