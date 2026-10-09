'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { MembershipPlanItem } from '@/types';
import { api } from '@/api/client';
import { EASE } from '@/lib/motion';

interface MembershipSignupModalProps {
  open: boolean;
  onClose: () => void;
  selectedPlan: MembershipPlanItem | null;
  billingCycle: 'monthly' | 'annual';
}

export default function MembershipSignupModal({
  open,
  onClose,
  selectedPlan,
  billingCycle,
}: MembershipSignupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'BGC Flagship Club',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSubmitted(false);
        setError(null);
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!selectedPlan) return null;

  const price = billingCycle === 'annual' ? selectedPlan.price_annual : selectedPlan.price_monthly;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError('Please provide your full name and email address.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await api.entities.MembershipSignups.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        billing_cycle: billingCycle,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to submit membership application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.4, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-modal-title"
            className="relative w-full max-w-lg bg-card border border-border/80 shadow-2xl p-6 sm:p-8 z-10 my-8 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close signup modal"
              className="absolute top-5 right-5 p-2 text-foreground/70 hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <div>
                <div className="mb-6 pr-8">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/10 border border-primary/30 text-[0.68rem] uppercase tracking-wider text-primary font-mono mb-3">
                    <span>{selectedPlan.name} Tier</span>
                    <span>·</span>
                    <span className="capitalize">{billingCycle} Billing</span>
                  </div>
                  <h3 id="signup-modal-title" className="font-heading text-2xl text-foreground">
                    Membership Enrolment
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lock in your tier benefits at{' '}
                    <span className="font-mono text-foreground font-semibold">${price}/mo</span>
                    {billingCycle === 'annual' ? ' (billed annually at ~20% savings)' : ''}.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sebastian Sterling"
                      className="w-full px-3.5 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sterling@apex.club"
                        className="w-full px-3.5 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+63 917 800 1234"
                        className="w-full px-3.5 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                      Preferred Home Club
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                    >
                      <option value="BGC Flagship Club">BGC Flagship Club (Taguig)</option>
                      <option value="Makati Sanctuary Club">Makati Sanctuary Club (Salcedo)</option>
                      <option value="Ortigas High Performance">Ortigas High Performance Club</option>
                      <option value="Alabang Reserve Club">Alabang Reserve Club</option>
                      <option value="New Manila Penthouse">New Manila Penthouse Club (QC)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center gap-2 text-[0.72rem] text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>No immediate charge today. Our membership director will contact you.</span>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full min-h-[46px] bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <span>Join Now · Confirm {selectedPlan.name} Tier</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-5">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-heading text-2xl text-foreground mb-2">
                  Welcome to Apex
                </h3>
                <p className="text-xs uppercase tracking-widest text-primary font-mono mb-4">
                  Tier: {selectedPlan.name} · {billingCycle.toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">
                  Your application has been logged with our concierge desk. We have sent a membership agreement package to <span className="text-foreground font-medium">{formData.email}</span>.
                </p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

