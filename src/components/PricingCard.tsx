'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, EASE } from '@/lib/motion';
import { MembershipPlanItem } from '@/types';

export interface PricingCardProps {
  plan: MembershipPlanItem;
  annual: boolean;
  index?: number;
  onSelect: (plan: MembershipPlanItem) => void;
}

export default function PricingCard({ plan, annual, index = 0, onSelect }: PricingCardProps) {
  const price = annual ? plan.price_annual : plan.price_monthly;
  const period = annual ? '/mo (billed annually)' : '/month';
  const isElite = plan.best_offer || plan.id === 'tier-elite';

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'relative flex flex-col transition-all duration-500 rounded-none bg-card',
        isElite
          ? 'p-8 sm:p-10 border-2 border-primary shadow-[0_0_40px_rgba(203,177,142,0.18)] z-20 lg:scale-[1.08] lg:-my-3 order-first lg:order-none'
          : 'p-6 sm:p-8 border border-border/70 hover:border-border text-card-foreground order-2 lg:order-none'
      )}
    >
      {/* Looping shimmer on Elite */}
      {isElite && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-primary/15 to-transparent -skew-x-12 animate-shimmer" />
        </div>
      )}

      {/* Best Offer Badge */}
      {isElite && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-primary text-primary-foreground text-[0.62rem] uppercase tracking-ultra px-4 py-1.5 font-bold shadow-md whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-primary-foreground fill-current" />
          <span>Best Offer</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.65rem] uppercase tracking-ultra text-primary font-mono">{plan.tagline}</p>
        {annual && (
          <span className="text-[0.62rem] text-primary/90 font-medium uppercase tracking-wider bg-primary/10 px-2 py-0.5 border border-primary/20">
            Save 20%
          </span>
        )}
      </div>

      <h3 className={cn('mt-2 font-heading text-foreground', isElite ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl')}>
        {plan.name}
      </h3>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-2xl text-foreground font-light">$</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={price}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={cn('font-heading tracking-tight text-foreground font-semibold', isElite ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl')}
          >
            {price}
          </motion.span>
        </AnimatePresence>
        <span className="text-foreground/50 text-xs font-mono">{period}</span>
      </div>

      <p className="mt-4 text-foreground/70 text-xs sm:text-sm leading-relaxed min-h-[40px]">
        {plan.description}
      </p>

      <div className="my-6 h-px w-full bg-border/50" />

      {/* Feature list */}
      <ul className="space-y-3 flex-1">
        {plan.features?.map((f) => (
          <li key={f} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/80">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {/* Join Now CTA */}
      <button
        onClick={() => onSelect(plan)}
        aria-label={`Join now with ${plan.name} tier`}
        className={cn(
          'mt-8 w-full min-h-[46px] flex items-center justify-center text-center py-3.5 uppercase tracking-label text-[0.7rem] font-semibold transition-all duration-300 select-none group',
          isElite
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-primary/20'
            : 'border border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/5'
        )}
      >
        <span>Join Now</span>
        {isElite && <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>}
      </button>
    </motion.div>
  );
}