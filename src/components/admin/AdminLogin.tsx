'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import Link from '@/components/Link';
import { api } from '@/api/client';
import { AuthUser } from '@/types';
import { toast } from 'sonner';

interface AdminLoginProps {
  onSuccess: (user: AuthUser) => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide your admin email and password credentials.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await api.auth.loginViaEmailPassword(email, password);
      if (user.role !== 'admin') {
        setError('Access denied: The supplied account does not possess administrator credentials.');
        toast.error('Unauthorized: Administrator privileges required.');
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${user.name}`);
      onSuccess(user);
    } catch {
      setError('Invalid credentials or authentication server timed out.');
      toast.error('Authentication failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await api.auth.loginAsAdmin();
      toast.success('Admin demo access granted.');
      onSuccess(user);
    } catch {
      setError('Failed to initialize demo session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md border border-border/80 bg-card/85 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-none border border-primary/40 bg-primary/10 text-primary mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <p className="text-[0.68rem] uppercase tracking-ultra font-mono text-primary font-medium">
            Executive Portal
          </p>
          <h1 className="font-heading text-3xl font-normal text-foreground tracking-tight">
            Apex Admin Suite
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Restricted access for club directors, operations managers, and concierge leads.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 border border-red-500/30 bg-red-950/20 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleManualLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[0.7rem] uppercase tracking-wider font-mono text-muted-foreground block">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@apexfitness.ph"
                className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-background/80 border border-border/70 text-foreground text-xs font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.7rem] uppercase tracking-wider font-mono text-muted-foreground block">
              Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-background/80 border border-border/70 text-foreground text-xs font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-ultra font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 select-none disabled:opacity-60 shadow-lg"
          >
            <span>{loading ? 'Authenticating...' : 'Enter Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Button */}
        <div className="pt-2 border-t border-border/60 text-center space-y-3">
          <p className="text-[0.68rem] text-muted-foreground font-mono uppercase tracking-wider">
            Pair Programming Demo Mode
          </p>
          <button
            type="button"
            onClick={handleOneClickDemo}
            disabled={loading}
            className="w-full min-h-[44px] px-4 py-2.5 border border-primary/40 bg-primary/10 text-primary text-xs uppercase tracking-wider font-mono hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Instant Demo Admin Login</span>
          </button>
        </div>

        {/* Back to public site */}
        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors font-mono min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Club Site</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

