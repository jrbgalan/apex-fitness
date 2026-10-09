import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import PricingCard from '@/components/PricingCard';
import Accordion from '@/components/Accordion';
import { stagger, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

const FAQ = [
  { q: 'Is there a joining fee?', a: 'A one-time orientation fee of $120 applies to all tiers, waived for annual commitments.' },
  { q: 'Can I freeze my membership?', a: 'Yes — up to four weeks per year, no charge, for any reason.' },
  { q: 'Are classes included?', a: 'All group classes are included in every tier. Specialty small-group sessions begin at the Apex tier.' },
  { q: 'What is the commitment?', a: 'Monthly plans are month-to-month. Annual plans are paid upfront and save roughly two months.' },
  { q: 'Can I change tiers?', a: 'Upgrade anytime. Downgrade at the start of your next billing cycle.' },
];

export default function Membership() {
  const [plans, setPlans] = useState([]);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    api.entities.MembershipPlan.list('order', 3).then(setPlans).catch(() => {});
  }, []);

  return (
    <PageTransition>
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12 text-center">
        <SectionHeading
          label="The commitment"
          title="Choose your standard."
          intro="Three tiers. One philosophy. No hidden fees, no contracts you can't leave."
          align="center"
          className="mx-auto"
        />
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="inline-flex border border-border p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn('px-6 py-2.5 text-[0.7rem] uppercase tracking-label transition-colors', !annual ? 'bg-primary text-primary-foreground' : 'text-foreground/60')}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn('px-6 py-2.5 text-[0.7rem] uppercase tracking-label transition-colors', annual ? 'bg-primary text-primary-foreground' : 'text-foreground/60')}
            >
              Annual
            </button>
          </div>
          <p className="text-[0.6rem] uppercase tracking-label text-primary/80">Annual saves roughly two months</p>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 max-w-6xl mx-auto items-stretch"
        >
          {plans.map((p) => (
            <PricingCard key={p.id} plan={p} annual={annual} />
          ))}
        </motion.div>
      </section>

      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border max-w-3xl mx-auto">
        <SectionHeading label="Questions" title="Before you commit." />
        <div className="mt-10">
          <Accordion items={FAQ} />
        </div>
      </section>
    </PageTransition>
  );
}