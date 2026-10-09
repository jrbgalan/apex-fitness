'use client';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from '@/components/Link';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/motion';

import { MembershipPlanItem } from '@/types';

export interface PricingCardProps {
  plan: MembershipPlanItem;
  annual: boolean;
  index?: number;
}

export default function PricingCard({ plan, annual, index = 0 }: PricingCardProps) {
  const price = annual ? plan.price_annual : plan.price_monthly;
  const period = annual ? '/year' : '/month';

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'relative flex flex-col p-8 md:p-10 border transition-all duration-500',
        plan.highlighted
          ? 'border-primary bg-card md:scale-[1.03] md:-my-2 shadow-sm order-first md:order-none'
          : 'border-border/60 bg-card/40 hover:border-border order-none'
      )}
    >
      {plan.highlighted && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[0.55rem] uppercase tracking-ultra px-3.5 py-1 font-medium whitespace-nowrap">
          Most chosen
        </span>
      )}
      <p className="text-[0.6rem] uppercase tracking-ultra text-primary">{plan.tagline}</p>
      <h3 className="mt-3 font-heading text-3xl text-foreground">{plan.name}</h3>
      <div className="mt-6 flex items-end gap-1 overflow-hidden">
        <span className="font-heading text-5xl text-foreground">${price.toLocaleString()}</span>
        <span className="text-foreground/50 text-sm mb-2">{period}</span>
      </div>
      <p className="mt-4 text-foreground/60 text-sm leading-relaxed max-w-[45ch]">{plan.description}</p>
      <ul className="mt-8 space-y-4 flex-1">
        {plan.features?.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/book-tour"
        className={cn(
          'mt-10 w-full min-h-[44px] flex items-center justify-center text-center py-4 uppercase tracking-label text-[0.7rem] font-medium transition-colors',
          plan.highlighted
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border border-border text-foreground hover:border-primary hover:text-primary'
        )}
      >
        {plan.highlighted ? `Choose ${plan.name}` : 'Select Plan'}
      </Link>
    </motion.div>
  );
}