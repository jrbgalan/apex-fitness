'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import TrainerCard from '@/components/TrainerCard';
import { stagger, viewportOnce } from '@/lib/motion';
import { TrainerItem } from '@/types';

const TrainerDetailModal = dynamic(() => import('@/components/TrainerDetailModal'), { ssr: false });

export default function Trainers() {
  const [trainers, setTrainers] = useState<TrainerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TrainerItem | null>(null);

  const fetchTrainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.entities.Trainer.list('order', 6);
      setTrainers(data || []);
    } catch {
      setError('Unable to load our coaches right now. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  return (
    <PageTransition>
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12">
        <SectionHeading
          label="The people"
          title="Mastery, on staff."
          intro="Six specialists. Each devoted to a single discipline. No generalists."
        />
      </section>

      <section className="px-6 md:px-12 pb-24 min-h-[300px]">
        {error ? (
          <div className="p-8 border border-border/60 text-center max-w-lg mx-auto my-12">
            <AlertCircle className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="text-foreground/70 text-sm mb-6">{error}</p>
            <button
              onClick={fetchTrainers}
              className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-xs uppercase tracking-label text-foreground hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-card border border-border/40 animate-pulse p-6 flex flex-col justify-end">
                <div className="h-3 w-16 bg-muted rounded mb-2" />
                <div className="h-6 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-24 text-foreground/60 text-sm">
            No trainers currently scheduled. Please check back shortly.
          </div>
        ) : (
          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            animate="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {trainers.map((t, i) => (
              <TrainerCard
                key={t.id}
                trainer={t}
                index={i}
                onClick={() => setSelected(t)}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Code-split Accessible Trainer Drawer */}
      <TrainerDetailModal
        trainer={selected}
        onClose={() => setSelected(null)}
      />
    </PageTransition>
  );
}