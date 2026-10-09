'use client';

import React from 'react';
import Link from '@/components/Link';
import {
  LayoutDashboard,
  CalendarCheck,
  UserCheck,
  Dumbbell,
  Users,
  MapPin,
  ShoppingBag,
  Package,
  MailCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AdminTab =
  | 'overview'
  | 'bookings'
  | 'memberships'
  | 'classes'
  | 'trainers'
  | 'locations'
  | 'products'
  | 'orders'
  | 'subscribers';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  badgeCounts?: {
    bookings?: number;
    orders?: number;
    lowStock?: number;
  };
}

const NAV_ITEMS: {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'bookings' | 'orders' | 'lowStock';
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Tour Bookings', icon: CalendarCheck, badgeKey: 'bookings' },
  { id: 'memberships', label: 'Memberships', icon: UserCheck },
  { id: 'classes', label: 'Classes & Schedule', icon: Dumbbell },
  { id: 'trainers', label: 'Trainers', icon: Users },
  { id: 'locations', label: 'Club Sanctuaries', icon: MapPin },
  { id: 'products', label: 'Shop Inventory', icon: ShoppingBag, badgeKey: 'lowStock' },
  { id: 'orders', label: 'Orders', icon: Package, badgeKey: 'orders' },
  { id: 'subscribers', label: 'Subscribers', icon: MailCheck },
];

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapsed,
  isMobileOpen,
  onCloseMobile,
  badgeCounts = {},
}: AdminSidebarProps) {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d0d0d] border-r border-border/70 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-border/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 border border-primary/40 bg-primary/10 text-primary shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-heading text-lg font-bold tracking-[0.15em] text-foreground block leading-none">
                APEX
              </span>
              <span className="text-[0.62rem] uppercase tracking-ultra text-primary font-mono block mt-0.5">
                Admin Console
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapsed}
          className="hidden lg:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
          aria-label="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ id, label, icon: Icon, badgeKey }) => {
          const isActive = activeTab === id;
          const badgeVal = badgeKey ? badgeCounts[badgeKey] : undefined;

          return (
            <button
              key={id}
              onClick={() => {
                onSelectTab(id);
                onCloseMobile();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono transition-all relative group',
                isActive
                  ? 'bg-primary/15 text-primary border-l-2 border-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
              )}
              title={isCollapsed ? label : undefined}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left uppercase tracking-wider text-[0.72rem]">
                  {label}
                </span>
              )}

              {badgeVal !== undefined && badgeVal > 0 && !isCollapsed && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[0.62rem] font-bold rounded-none font-mono',
                    badgeKey === 'lowStock'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-primary/20 text-primary border border-primary/30'
                  )}
                >
                  {badgeVal}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Return Link */}
      <div className="p-3 border-t border-border/70 shrink-0">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors min-h-[44px]',
            isCollapsed && 'justify-center'
          )}
          title="Exit to Public Website"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <span className="truncate uppercase tracking-wider text-[0.68rem]">
              Public Site
            </span>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block h-screen sticky top-0 transition-all duration-300 z-40 shrink-0',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
