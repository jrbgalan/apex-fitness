'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';
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
  const shouldReduceMotion = useReducedMotion();

  // 3D Tilt for desktop on Elite card
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !isElite || typeof window === 'undefined' || window.innerWidth < 1024) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Calculate subtle tilt angle
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative transition-all duration-300',
        isElite
          ? 'z-20 lg:scale-[1.08] lg:-my-4 order-first lg:order-none'
          : 'order-2 lg:order-none z-10'
      )}
      style={{
        perspective: isElite && !shouldReduceMotion ? 1000 : undefined,
      }}
    >
      {/* Soft Ambient Glow behind Elite card */}
      {isElite && (
        <div
          className={cn(
            'absolute -inset-2 bg-primary/25 blur-2xl -z-20 pointer-events-none transition-opacity duration-700',
            isHovered ? 'opacity-100 scale-105' : 'opacity-60 scale-100'
          )}
        />
      )}

      {/* Thin Champagne Gradient Border with 6s Shimmer Loop */}
      {isElite && (
        <div className="absolute -inset-[1.5px] bg-gradient-to-r from-primary/30 via-primary to-primary/30 animate-border-shimmer -z-10 pointer-events-none" />
      )}

      {/* Animated Card Body Container */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
          // Elite card rises in last with a longer, more dramatic reveal
          delay: isElite ? 0.38 : (index % 4) * 0.1,
          duration: isElite ? 0.95 : 0.7,
          ease: EASE,
        }}
        animate={
          isElite && !shouldReduceMotion
            ? {
                rotateX: tilt.x,
                rotateY: tilt.y,
              }
            : undefined
        }
        className={cn(
          'relative flex flex-col h-full bg-card select-none text-left',
          isElite
            ? 'p-8 sm:p-10 border border-primary/60 shadow-[0_0_50px_rgba(203,177,142,0.22)]'
            : 'p-6 sm:p-8 border border-border/50 bg-card/75 hover:border-border/80 hover:-translate-y-1 transition-all duration-300'
        )}
      >
        {/* Mobile subtle pulse/shimmer */}
        {isElite && (
          <div className="lg:hidden absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12 animate-shimmer" />
          </div>
        )}

        {/* Floating Best Offer Badge with Shine Sweep */}
        {isElite && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 animate-float-badge">
            <div className="relative overflow-hidden flex items-center gap-1.5 bg-primary text-primary-foreground text-[0.62rem] uppercase tracking-ultra px-4 py-1.5 font-bold shadow-lg whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-primary-foreground fill-current shrink-0" />
              <span>Best Offer</span>
              {/* Shine sweep across badge */}
              {!shouldReduceMotion && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine-sweep" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header Tagline & Annual badge */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.65rem] uppercase tracking-ultra text-primary font-mono">{plan.tagline}</p>
          {annual && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="text-[0.62rem] text-primary/95 font-semibold uppercase tracking-wider bg-primary/15 px-2 py-0.5 border border-primary/30"
            >
              Save 20%
            </motion.span>
          )}
        </div>

        <h3 className={cn('mt-2 font-heading text-foreground', isElite ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl')}>
          {plan.name}
        </h3>

        {/* Rolling Number Price Animation */}
        <div className="mt-5 flex items-baseline gap-1.5">
          <span className="text-2xl text-foreground font-light">$</span>
          <div className="overflow-hidden inline-flex items-baseline">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={price}
                initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: shouldReduceMotion ? 0 : -30, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={cn(
                  'font-heading tracking-tight text-foreground font-semibold inline-block',
                  isElite ? 'text-5xl sm:text-6xl text-primary font-bold' : 'text-4xl sm:text-5xl'
                )}
              >
                {price}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-foreground/50 text-xs font-mono">{period}</span>
        </div>

        <p className="mt-4 text-foreground/70 text-xs sm:text-sm leading-relaxed min-h-[40px]">
          {plan.description}
        </p>

        <div className="my-6 h-px w-full bg-border/50" />

        {/* Feature Checklist - Ticks in one by one with stagger */}
        <ul className="space-y-3.5 flex-1">
          {plan.features?.map((f, i) => (
            <motion.li
              key={f}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: (isElite ? 0.45 : 0.2) + i * 0.05,
                duration: 0.35,
                ease: EASE,
              }}
              className="flex items-start gap-3 text-xs sm:text-sm text-foreground/80"
            >
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="leading-snug">{f}</span>
            </motion.li>
          ))}
        </ul>

        {/* Join Now CTA with Light-Sweep Effect on Elite */}
        <button
          onClick={() => onSelect(plan)}
          aria-label={`Join now with ${plan.name} tier`}
          className={cn(
            'mt-8 w-full min-h-[48px] flex items-center justify-center text-center py-3.5 uppercase tracking-label text-[0.7rem] font-semibold transition-all duration-300 group relative overflow-hidden',
            isElite
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
              : 'border border-border/80 text-foreground hover:border-primary hover:text-primary hover:bg-primary/5'
          )}
        >
          {/* Light-sweep effect on Elite button */}
          {isElite && !shouldReduceMotion && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine-sweep" />
            </div>
          )}

          <span className="relative z-10 flex items-center gap-1.5">
            <span>Join Now</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </motion.div>
    </div>
  );
}