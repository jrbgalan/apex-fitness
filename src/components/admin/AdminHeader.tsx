'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import Link from '@/components/Link';
import { AuthUser } from '@/types';
import { api } from '@/api/client';
import { toast } from 'sonner';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  currentUser: AuthUser | null;
  onOpenMobileNav: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function AdminHeader({
  title,
  subtitle,
  currentUser,
  onOpenMobileNav,
  onLogout,
  searchQuery,
  onSearchChange,
}: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await api.auth.logout();
    toast.success('Signed out of admin session');
    onLogout();
  };

  return (
    <header className="h-16 border-b border-border/70 bg-[#0c0c0c]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-heading text-lg sm:text-xl font-semibold text-foreground tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[0.68rem] text-muted-foreground font-mono hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center: Live search input */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bookings, members, orders, items..."
            className="w-full h-9 pl-9 pr-3 bg-card/70 border border-border/60 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 border border-border/70 bg-card/60 hover:border-primary/50 transition-all min-h-[44px]"
            aria-expanded={menuOpen}
          >
            <div className="w-7 h-7 rounded-none bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-mono text-xs font-bold shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>

            <div className="text-left hidden sm:block">
              <span className="text-xs font-medium text-foreground block leading-tight truncate max-w-[120px]">
                {currentUser?.name || 'Administrator'}
              </span>
              <span className="text-[0.6rem] uppercase tracking-ultra font-mono text-primary block">
                Executive
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 border border-border/80 bg-[#121212] shadow-2xl p-1 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="p-3 border-b border-border/60 mb-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[0.7rem] text-muted-foreground font-mono truncate mt-0.5">
                  {currentUser?.email || 'admin@apexfitness.ph'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary text-[0.62rem] font-mono uppercase tracking-wider">
                  <Shield className="w-3 h-3" />
                  <span>Admin Role</span>
                </div>
              </div>

              <Link
                to="/"
                className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-card/70 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span>Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
              >
                <span>Sign Out</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
