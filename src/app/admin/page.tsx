'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import {
  AuthUser,
  TourBookingData,
  MembershipSignupData,
  OrderData,
  ProductItem,
  ClassItem,
  ScheduleSlotItem,
  TrainerItem,
  LocationItem,
  NewsletterSubscriberData,
} from '@/types';
import AdminSidebar, { AdminTab } from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminMemberships from '@/components/admin/AdminMemberships';
import AdminClasses from '@/components/admin/AdminClasses';
import AdminTrainersLocations from '@/components/admin/AdminTrainersLocations';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminSubscribers from '@/components/admin/AdminSubscribers';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TAB_META: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Executive Overview',
    subtitle: 'High-level telemetry, key performance indicators, and member activity',
  },
  bookings: {
    title: 'Sanctuary Tour Bookings',
    subtitle: 'Manage client private tour requests and scheduled walkthroughs',
  },
  memberships: {
    title: 'Membership Registrations',
    subtitle: 'Review incoming tier registrations, billing intervals, and member status',
  },
  classes: {
    title: 'Class Curriculum & Schedule',
    subtitle: 'Manage sanctuary training sessions, master disciplines, and time slots',
  },
  trainers: {
    title: 'Master Trainers Directory',
    subtitle: 'Review and manage elite resident coaches and personal trainers',
  },
  locations: {
    title: 'Club Sanctuaries',
    subtitle: 'Manage flagship locations, operating hours, and club amenities',
  },
  products: {
    title: 'Boutique Inventory',
    subtitle: 'Manage performance wear, wellness tech, supplements, and live stock',
  },
  orders: {
    title: 'Boutique Orders',
    subtitle: 'Fulfill customer orders, update tracking states, and generate invoices',
  },
  subscribers: {
    title: 'Newsletter Registry',
    subtitle: 'Manage verified subscriber roster for club announcements and dispatches',
  },
};

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  // Entities state
  const [bookings, setBookings] = useState<TourBookingData[]>([]);
  const [signups, setSignups] = useState<MembershipSignupData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlotItem[]>([]);
  const [trainers, setTrainers] = useState<TrainerItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberData[]>([]);

  // 1. Check Authentication on Mount
  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (user && user.role === 'admin') {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
    setAuthChecking(false);
  }, []);

  // 2. Load Data when authenticated
  const loadAllData = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setDataLoading(true);
    try {
      const [
        bkgs,
        sgnps,
        ords,
        prods,
        clss,
        slots,
        trns,
        locs,
        subs,
      ] = await Promise.all([
        api.tourBookings.getAll(),
        api.membershipSignups.getAll(),
        api.orders.getAll(),
        api.products.getAll(),
        api.classes.getAll(),
        api.scheduleSlots.getAll(),
        api.trainers.getAll(),
        api.locations.getAll(),
        api.subscribers.getAll(),
      ]);

      setBookings(bkgs || []);
      setSignups(sgnps || []);
      setOrders(ords || []);
      setProducts(prods || []);
      setClasses(clss || []);
      setScheduleSlots(slots || []);
      setTrainers(trns || []);
      setLocations(locs || []);
      setSubscribers(subs || []);
    } catch (err) {
      console.error('Error loading admin dataset:', err);
    } finally {
      setDataLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      loadAllData();
    }
  }, [currentUser, loadAllData]);

  // Compute live badge counts
  const badgeCounts = {
    bookings: bookings.filter((b) => b.status === 'New').length,
    orders: orders.filter((o) => o.status === 'Processing').length,
    lowStock: products.filter((p) => (p.stock ?? p.stock_quantity ?? 0) < 5).length,
  };

  // Auth checking skeleton
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs tracking-widest uppercase text-muted-foreground font-mono">
          Authenticating Executive Session...
        </p>
      </div>
    );
  }

  // Not authenticated or not admin -> render login
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <AdminLogin
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  const currentMeta = TAB_META[activeTab] || {
    title: 'Admin Console',
    subtitle: 'Apex Fitness Management Suite',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Collapsible Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        isCollapsed={isCollapsed}
        onToggleCollapsed={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        badgeCounts={badgeCounts}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Top Navigation Bar */}
        <AdminHeader
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          currentUser={currentUser}
          onOpenMobileNav={() => setIsMobileOpen(true)}
          onLogout={() => setCurrentUser(null)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {dataLoading && (
            <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-card/60 border border-border text-xs text-muted-foreground w-fit animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Synchronizing club records...</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <AdminOverview
              bookings={bookings}
              signups={signups}
              orders={orders}
              products={products}
              classes={classes}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'bookings' && (
            <AdminBookings bookings={bookings} onRefresh={loadAllData} />
          )}

          {activeTab === 'memberships' && (
            <AdminMemberships signups={signups} onRefresh={loadAllData} />
          )}

          {activeTab === 'classes' && (
            <AdminClasses
              classes={classes}
              scheduleSlots={scheduleSlots}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'trainers' && (
            <AdminTrainersLocations
              trainers={trainers}
              locations={locations}
              onRefresh={loadAllData}
              initialSubTab="trainers"
            />
          )}

          {activeTab === 'locations' && (
            <AdminTrainersLocations
              trainers={trainers}
              locations={locations}
              onRefresh={loadAllData}
              initialSubTab="locations"
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts products={products} onRefresh={loadAllData} />
          )}

          {activeTab === 'orders' && (
            <AdminOrders orders={orders} onRefresh={loadAllData} />
          )}

          {activeTab === 'subscribers' && (
            <AdminSubscribers subscribers={subscribers} onRefresh={loadAllData} />
          )}
        </main>
      </div>
    </div>
  );
}
