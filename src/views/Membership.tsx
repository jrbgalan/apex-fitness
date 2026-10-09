'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import PricingCard from '@/components/PricingCard';
import MembershipComparisonTable from '@/components/membership/MembershipComparisonTable';
import MembershipSignupModal from '@/components/membership/MembershipSignupModal';
import Accordion from '@/components/Accordion';
import { stagger, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { MembershipPlanItem } from '@/types';

const FAQ = [
  { q: 'Is there a joining fee?', a: 'A one-time orientation fee applies to all tiers, waived for annual commitments.' },
  { q: 'Can I freeze my membership?', a: 'Yes — up to four weeks per calendar year, at zero penalty, for travel or recovery.' },
  { q: 'Are all group classes included?', a: 'Group classes are included in Plus, Elite, and Black Card tiers. Specialty private sessions and masterclasses are included in Elite and Black Card.' },
  { q: 'What is the commitment term?', a: 'Monthly memberships are flexible month-to-month contracts. Annual commitments save approximately 20% and are billed annually.' },
  { q: 'Can I change or upgrade tiers?', a: 'You may upgrade at any time with immediate effect. Downgrades take effect upon the commencement of your next billing cycle.' },
  { q: 'Are guest privileges included?', a: 'Plus includes 1 monthly guest pass, Elite includes 4 guest passes per month, and Black Card offers unlimited guest accompaniment.' },
];

export default function Membership() {
  const [plans, setPlans] = useState<MembershipPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlanItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.entities.MembershipPlan.list('order', 10);
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

  const handleOpenSignup = (plan: MembershipPlanItem) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <PageTransition>
      {/* Header & Toggle Section */}
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12 text-center max-w-5xl mx-auto">
        <SectionHeading
          label="The Commitment"
          title="Choose your standard."
          intro="Four distinct tiers engineered for bespoke athletic progression. Zero hidden fees, zero restrictive lock-ins."
          align="center"
          className="mx-auto"
        />

        {/* Monthly / Annual Toggle with Sliding Pill Indicator */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="relative inline-flex border border-border/80 p-1 bg-card/80 shadow-md">
            <button
              onClick={() => setAnnual(false)}
              className="relative min-h-[44px] px-6 py-2.5 text-[0.7rem] uppercase tracking-ultra transition-colors select-none flex items-center justify-center font-medium z-10"
            >
              {!annual && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-primary shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  'relative z-10 transition-colors',
                  !annual ? 'text-primary-foreground font-semibold' : 'text-foreground/70 hover:text-foreground'
                )}
              >
                Monthly Billing
              </span>
            </button>

            <button
              onClick={() => setAnnual(true)}
              className="relative min-h-[44px] px-6 py-2.5 text-[0.7rem] uppercase tracking-ultra transition-colors select-none flex items-center justify-center font-medium z-10 gap-2"
            >
              {annual && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-primary shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  'relative z-10 transition-colors',
                  annual ? 'text-primary-foreground font-semibold' : 'text-foreground/70 hover:text-foreground'
                )}
              >
                Annual Billing
              </span>
              <AnimatePresence>
                {annual && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative z-10 text-[0.62rem] bg-black/30 text-primary-foreground px-1.5 py-0.5 rounded font-mono font-semibold"
                  >
                    Save 20%
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <p className="text-[0.62rem] uppercase tracking-ultra text-primary/80 font-mono">
            Annual commitment saves up to $720/year
          </p>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto min-h-[400px]">
        {error ? (
          <div className="p-8 border border-border/60 text-center max-w-lg mx-auto my-12 bg-card">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border/60 bg-card/40 p-8 space-y-6 animate-pulse">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-12 w-24 bg-muted/70 rounded" />
                <div className="h-28 w-full bg-muted/40 rounded" />
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
            className="flex flex-col lg:grid lg:grid-cols-4 gap-6 lg:gap-4 items-stretch"
          >
            {plans.map((p, idx) => (
              <PricingCard
                key={p.id}
                plan={p}
                annual={annual}
                index={idx}
                onSelect={handleOpenSignup}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Full Feature Comparison Table Section */}
      <section className="px-6 md:px-12 py-20 bg-card/25 border-y border-border/70">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            label="In-Depth Matrix"
            title="Comprehensive tier breakdown."
            intro="Examine exact amenities, guest privileges, recovery suites, and private coaching allowances across all four membership plans."
            align="center"
            className="mb-14 mx-auto"
          />

          <MembershipComparisonTable
            plans={plans}
            annual={annual}
            onSelectPlan={handleOpenSignup}
          />
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-6 md:px-12 py-24 max-w-4xl mx-auto">
        <SectionHeading
          label="Transparency"
          title="Frequently asked questions."
          intro="Everything you need to know about our admissions policy, guest allowances, and membership governance."
          align="center"
          className="mx-auto"
        />
        <div className="mt-12">
          <Accordion items={FAQ} />
        </div>
      </section>

      {/* Membership Signup Modal */}
      <MembershipSignupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedPlan={selectedPlan}
        billingCycle={annual ? 'annual' : 'monthly'}
      />
    </PageTransition>
  );
}