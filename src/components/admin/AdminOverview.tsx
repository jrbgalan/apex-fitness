'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  CalendarCheck,
  UserCheck,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TourBookingData,
  MembershipSignupData,
  OrderData,
  ProductItem,
  ClassItem,
} from '@/types';
import { cn } from '@/lib/utils';
import { AdminTab } from './AdminSidebar';

interface AdminOverviewProps {
  bookings: TourBookingData[];
  signups: MembershipSignupData[];
  orders: OrderData[];
  products: ProductItem[];
  classes: ClassItem[];
  onNavigateTab: (tab: AdminTab) => void;
}

type DateRange = '7d' | '30d' | '90d';

const CHAMPAGNE_COLORS = ['#D4AF37', '#E5C158', '#B89726', '#8F7317', '#F5E5A3'];

// Reusable Count-up animation
function Counter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(ease * value));
      if (progress < 1) requestAnimationFrame(frame);
      else setDisplayValue(value);
    };

    requestAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// Custom tooltip for Recharts matching dark champagne aesthetic
function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121212] border border-primary/40 p-2.5 shadow-xl text-xs font-mono space-y-1">
        {label && <p className="text-muted-foreground uppercase text-[0.65rem]">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-foreground font-semibold flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: entry.color || entry.payload?.fill || '#D4AF37' }}
            />
            <span>{entry.name || 'Value'}:</span>
            <span className="text-primary">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AdminOverview({
  bookings,
  signups,
  orders,
  products,
  classes,
  onNavigateTab,
}: AdminOverviewProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter threshold date
  const cutoffDate = useMemo(() => {
    const d = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    d.setDate(d.getDate() - days);
    return d;
  }, [dateRange]);

  // Filtered collections based on dateRange
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => (b.created_at ? new Date(b.created_at) >= cutoffDate : true));
  }, [bookings, cutoffDate]);

  const filteredSignups = useMemo(() => {
    return signups.filter((s) => (s.created_at ? new Date(s.created_at) >= cutoffDate : true));
  }, [signups, cutoffDate]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => (o.created_at ? new Date(o.created_at) >= cutoffDate : true));
  }, [orders, cutoffDate]);

  // 1. KPI Computations
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  const newBookings7d = useMemo(() => {
    return bookings.filter((b) => (b.created_at ? new Date(b.created_at) >= sevenDaysAgo : true)).length;
  }, [bookings, sevenDaysAgo]);

  const totalMembers = signups.length;
  const totalOrdersCount = orders.length;
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, curr) => acc + (curr.total || curr.subtotal || 0), 0);
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock < 5).length;
  }, [products]);

  // 2. Chart 1: Revenue Over Time (Area Chart)
  const revenueChartData = useMemo(() => {
    const buckets: Record<string, number> = {};
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

    // Initialize date labels
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      buckets[label] = 0;
    }

    // Populate revenue
    filteredOrders.forEach((o) => {
      if (o.created_at) {
        const d = new Date(o.created_at);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (buckets[label] !== undefined) {
          buckets[label] += Math.round(o.total || o.subtotal || 0);
        }
      }
    });

    return Object.entries(buckets).map(([date, revenue]) => ({ date, revenue }));
  }, [filteredOrders, dateRange]);

  // 3. Chart 2: Signups by Plan (Donut Chart)
  const planChartData = useMemo(() => {
    const counts: Record<string, number> = {
      Essential: 0,
      Plus: 0,
      Elite: 0,
      'Black Card': 0,
    };
    filteredSignups.forEach((s) => {
      const name = s.plan_name || 'Elite';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredSignups]);

  // 4. Chart 3: Bookings per Location (Bar Chart)
  const locationChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredBookings.forEach((b) => {
      const loc = b.preferred_location?.replace('Apex ', '') || 'BGC Flagship';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts).map(([location, bookings]) => ({ location, bookings }));
  }, [filteredBookings]);

  // 5. Chart 4: Class Popularity (Horizontal Bar Chart)
  const classPopularityData = useMemo(() => {
    const counts: Record<string, number> = {
      Powerlifting: 28,
      'Reformer Pilates': 34,
      'Championship Boxing': 31,
      'High-RPM Spin': 26,
      'Infrared Hot Yoga': 22,
      'CrossFit WOD': 19,
    };
    return Object.entries(counts)
      .map(([name, attendees]) => ({ name, attendees }))
      .sort((a, b) => b.attendees - a.attendees);
  }, []);

  // 6. Recent Activity Feed (Interleaved)
  const recentActivity = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'booking' | 'signup' | 'order';
      title: string;
      desc: string;
      timestamp: string;
      amount?: number;
    }> = [];

    bookings.slice(0, 4).forEach((b) => {
      items.push({
        id: b.id || `act-b-${b.name}`,
        type: 'booking',
        title: `Tour Reserved: ${b.name}`,
        desc: `${b.preferred_location} · ${b.interest}`,
        timestamp: b.created_at || new Date().toISOString(),
      });
    });

    signups.slice(0, 4).forEach((s) => {
      items.push({
        id: s.id || `act-s-${s.name}`,
        type: 'signup',
        title: `New Member: ${s.name}`,
        desc: `${s.plan_name} Tier (${s.billing_cycle})`,
        timestamp: s.created_at || new Date().toISOString(),
      });
    });

    orders.slice(0, 4).forEach((o) => {
      items.push({
        id: o.id || `act-o-${o.order_number}`,
        type: 'order',
        title: `Order Placed: ${o.order_number}`,
        desc: `${o.customer_name} · ${o.items?.length || 1} line item(s)`,
        timestamp: o.created_at || new Date().toISOString(),
        amount: o.total || o.subtotal,
      });
    });

    return items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [bookings, signups, orders]);

  return (
    <div className="space-y-8 select-none">
      {/* Date Range Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl text-foreground font-semibold">
            Executive Metrics
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Real-time club performance, telemetry, and revenue distribution.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center p-1 border border-border/70 bg-card/60">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={cn(
                'px-3.5 py-1.5 text-[0.68rem] uppercase tracking-wider font-mono transition-all',
                dateRange === r
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r === '7d' ? 'Past 7 Days' : r === '30d' ? 'Past 30 Days' : 'Past 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Tour Bookings */}
        <div
          onClick={() => onNavigateTab('bookings')}
          className="p-5 border border-border/70 bg-card/60 hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] uppercase tracking-ultra font-mono text-muted-foreground">
              New Tours (7d)
            </span>
            <div className="p-2 bg-primary/10 text-primary border border-primary/20">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-heading text-3xl font-semibold text-foreground">
            <Counter value={newBookings7d} />
          </div>
          <div className="mt-1 flex items-center gap-1 text-[0.68rem] text-primary font-mono">
            <span>{bookings.length} total active inquiries</span>
          </div>
        </div>

        {/* KPI 2: Active Members */}
        <div
          onClick={() => onNavigateTab('memberships')}
          className="p-5 border border-border/70 bg-card/60 hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] uppercase tracking-ultra font-mono text-muted-foreground">
              Total Members
            </span>
            <div className="p-2 bg-primary/10 text-primary border border-primary/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-heading text-3xl font-semibold text-foreground">
            <Counter value={totalMembers} />
          </div>
          <div className="mt-1 flex items-center gap-1 text-[0.68rem] text-emerald-400 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+{filteredSignups.length} in this period</span>
          </div>
        </div>

        {/* KPI 3: Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-5 border border-border/70 bg-card/60 hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] uppercase tracking-ultra font-mono text-muted-foreground">
              Shop Orders
            </span>
            <div className="p-2 bg-primary/10 text-primary border border-primary/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-heading text-3xl font-semibold text-foreground">
            <Counter value={totalOrdersCount} />
          </div>
          <div className="mt-1 text-[0.68rem] text-muted-foreground font-mono">
            {orders.filter((o) => o.status === 'Processing').length} awaiting fulfillment
          </div>
        </div>

        {/* KPI 4: Revenue */}
        <div className="p-5 border border-border/70 bg-card/60 hover:border-primary/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] uppercase tracking-ultra font-mono text-muted-foreground">
              Shop Gross Volume
            </span>
            <div className="p-2 bg-primary/10 text-primary border border-primary/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-heading text-3xl font-semibold text-primary">
            <Counter value={Math.round(totalRevenue)} prefix="$" />
          </div>
          <div className="mt-1 text-[0.68rem] text-muted-foreground font-mono">
            Avg ${(totalRevenue / Math.max(1, totalOrdersCount)).toFixed(0)} / order
          </div>
        </div>

        {/* KPI 5: Low-Stock Items */}
        <div
          onClick={() => onNavigateTab('products')}
          className="p-5 border border-border/70 bg-card/60 hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] uppercase tracking-ultra font-mono text-muted-foreground">
              Low Stock Alert
            </span>
            <div
              className={cn(
                'p-2 border',
                lowStockCount > 0
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              )}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-heading text-3xl font-semibold text-foreground">
            <Counter value={lowStockCount} />
          </div>
          <div className="mt-1 text-[0.68rem] text-amber-400/90 font-mono">
            {lowStockCount > 0 ? 'Requires restock (<5 units)' : 'Inventory optimal'}
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart 1: Revenue Over Time Area Chart */}
          <div className="lg:col-span-8 p-6 border border-border/70 bg-card/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Revenue Trajectory
                </h3>
                <p className="text-[0.68rem] text-muted-foreground font-mono">
                  Daily merchandise & recovery retail volume ($USD)
                </p>
              </div>
              <span className="text-xs font-mono text-primary font-bold">
                ${Math.round(filteredOrders.reduce((a, b) => a + (b.total || 0), 0)).toLocaleString()}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="champagneArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    fontFamily="monospace"
                  />
                  <YAxis
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    fontFamily="monospace"
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#champagneArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Signups by Plan Donut Chart */}
          <div className="lg:col-span-4 p-6 border border-border/70 bg-card/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Plan Distribution
                </h3>
                <p className="text-[0.68rem] text-muted-foreground font-mono">
                  Active member tiers
                </p>
              </div>
              <span className="text-xs font-mono text-primary font-bold">
                {filteredSignups.length} Signups
              </span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {planChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHAMPAGNE_COLORS[index % CHAMPAGNE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 font-mono text-[0.68rem]">
              {planChartData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 shrink-0"
                    style={{ backgroundColor: CHAMPAGNE_COLORS[idx % CHAMPAGNE_COLORS.length] }}
                  />
                  <span className="truncate text-muted-foreground">{item.name}:</span>
                  <span className="text-foreground font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Secondary Charts Row & Recent Activity */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chart 3 & 4 Container */}
          <div className="lg:col-span-7 space-y-8">
            {/* Tour Bookings by Location Bar Chart */}
            <div className="p-6 border border-border/70 bg-card/50 space-y-4">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Tours by Club Sanctuary
                </h3>
                <p className="text-[0.68rem] text-muted-foreground font-mono">
                  Private tour interest distribution across metropolitan locations
                </p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="location"
                      stroke="#525252"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      fontFamily="monospace"
                    />
                    <YAxis stroke="#525252" fontSize={10} tickLine={false} fontFamily="monospace" />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="bookings" fill="#D4AF37" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Class Popularity Horizontal Bar Chart */}
            <div className="p-6 border border-border/70 bg-card/50 space-y-4">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Masterclass Demand Index
                </h3>
                <p className="text-[0.68rem] text-muted-foreground font-mono">
                  Weekly reservation volume by modality
                </p>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={classPopularityData}
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <XAxis type="number" stroke="#525252" fontSize={10} tickLine={false} fontFamily="monospace" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#525252"
                      fontSize={10}
                      tickLine={false}
                      fontFamily="monospace"
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="attendees" fill="#E5C158" radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: Recent Activity Feed */}
          <div className="lg:col-span-5 p-6 border border-border/70 bg-card/50 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Live Clubhouse Activity
                </h3>
                <p className="text-[0.68rem] text-muted-foreground font-mono">
                  Most recent bookings, signups, and store checkouts
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>

            <div className="space-y-3.5">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-border/50 bg-background/50 flex items-start gap-3 hover:border-primary/40 transition-colors"
                >
                  <div
                    className={cn(
                      'p-2 shrink-0 border text-xs',
                      item.type === 'booking'
                        ? 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                        : item.type === 'signup'
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    )}
                  >
                    {item.type === 'booking' && <CalendarCheck className="w-3.5 h-3.5" />}
                    {item.type === 'signup' && <UserCheck className="w-3.5 h-3.5" />}
                    {item.type === 'order' && <Package className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-foreground truncate font-heading">
                        {item.title}
                      </h4>
                      {item.amount && (
                        <span className="text-xs font-mono font-bold text-primary shrink-0">
                          ${item.amount.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground truncate mt-0.5 font-mono">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-1 text-[0.62rem] text-muted-foreground/70 font-mono mt-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

