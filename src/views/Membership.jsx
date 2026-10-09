'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import PricingCard from '@/components/PricingCard';
import Accordion from '@/components/Accordion';
import { stagger, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';

const FAQ = [
  { q: 'Is there a joining fee?', a: 'A one-time orientation fee applies to all tiers, waived for annual commitments.' },
  { q: 'Can I freeze my membership?', a: 'Yes — up to four weeks per year, no fee, for any personal reason.' },
  { q: 'Are classes included?', a: 'All group classes are included across every tier. Specialty small-group sessions start at the Apex tier.' },
  { q: 'What is the commitment?', a: 'Monthly plans remain month-to-month. Annual memberships are paid upfront and save two months.' },
  { q: 'Can I change tiers?', a: 'Upgrade whenever ready. Downgrades take effect at the start of your subsequent billing cycle.' },
];

export default function Membership() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [annual, setAnnual] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.entities.MembershipPlan.list('order', 3);
      setPlans(data || []);
    } catch {
      setError('Unable to load membership tiers right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <PageTransition>
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12 text-center">
        <SectionHeading
          label="The commitment"
          title="Choose your standard."
          intro="Three tiers. One philosophy. No hidden fees, no contracts you cannot leave."
          align="center"
          className="mx-auto"
        />
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="inline-flex border border-border/80 p-1 bg-card/60">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'min-h-[44px] px-6 py-2.5 text-[0.7rem] uppercase tracking-ultra transition-colors select-none flex items-center justify-center font-medium',
                !annual ? 'bg-primary text-primary-foreground' : 'text-foreground/60 hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'min-h-[44px] px-6 py-2.5 text-[0.7rem] uppercase tracking-ultra transition-colors select-none flex items-center justify-center font-medium',
                annual ? 'bg-primary text-primary-foreground' : 'text-foreground/60 hover:text-foreground'
              )}
            >
              Annual
            </button>
          </div>
          <p className="text-[0.6rem] uppercase tracking-ultra text-primary/80">Annual plans save two months</p>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto min-h-[400px]">
        {error ? (
          <div className="p-8 border border-border/60 text-center max-w-lg mx-auto my-12">
            <AlertCircle className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="text-foreground font-heading text-xl">Connection Notice</p>
            <p className="mt-2 text-foreground/60 text-sm">{error}</p>
            <button
              onClick={fetchPlans}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 border border-border text-[0.7rem] uppercase tracking-label text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-stretch">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border/60 bg-card/40 p-8 md:p-10 space-y-6 animate-pulse">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-12 w-24 bg-muted/70 rounded" />
                <div className="h-24 w-full bg-muted/40 rounded" />
                <div className="h-12 w-full bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-stretch"
          >
            {plans.map((p, idx) => (
              <PricingCard key={p.id} plan={p} annual={annual} index={idx} />
            ))}
          </motion.div>
        )}
      </section>

      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border/60 max-w-3xl mx-auto">
        <SectionHeading label="Questions" title="Before you commit." />
        <div className="mt-10">
          <Accordion items={FAQ} />
        </div>
      </section>
    </PageTransition>
  );
}