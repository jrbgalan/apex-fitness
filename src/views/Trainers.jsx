'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import Link from '@/components/Link';
import { api } from '@/api/client';
import { Image } from '@/components/ui/image';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import TrainerCard from '@/components/TrainerCard';
import { stagger, viewportOnce, EASE } from '@/lib/motion';

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

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
            <p className="text-foreground font-heading text-xl">Connection Notice</p>
            <p className="mt-2 text-foreground/60 text-sm">{error}</p>
            <button
              onClick={fetchTrainers}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 border border-border text-[0.7rem] uppercase tracking-label text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-card/60 border border-border/40 animate-pulse relative p-6 flex flex-col justify-end space-y-3">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-3 w-40 bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <div className="py-20 text-center border border-border/40">
            <p className="text-foreground/50 text-sm">No coach profiles currently available.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
          >
            {trainers.map((t, i) => (
              <TrainerCard key={t.id} trainer={t} index={i} onClick={() => setSelected(t)} />
            ))}
          </motion.div>
        )}
      </section>

      {/* Side drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.5, ease: EASE }}
              className="fixed top-0 right-0 bottom-0 z-[71] w-full max-w-md bg-card border-l border-border overflow-y-auto"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-foreground/70 hover:text-primary transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-[4/5] overflow-hidden bg-background">
                <Image
                  src={selected.image_url}
                  alt={`${selected.name}, ${selected.role}`}
                  fittingType="fill"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <p className="text-[0.6rem] uppercase tracking-ultra text-primary mb-2">{selected.role}</p>
                <h2 className="font-heading text-3xl sm:text-4xl text-foreground">{selected.name}</h2>
                <p className="mt-4 text-foreground/60 leading-relaxed text-sm max-w-[50ch]">{selected.bio}</p>
                <div className="mt-6">
                  <p className="text-[0.6rem] uppercase tracking-ultra text-foreground/45 mb-3">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.specialties?.map((s) => (
                      <span key={s} className="border border-border/60 px-3 py-1.5 text-xs text-foreground/70">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-6 text-[0.65rem] uppercase tracking-ultra text-foreground/45">
                  {selected.experience_years} years coaching
                </p>
                <Link
                  to="/book-tour"
                  onClick={() => setSelected(null)}
                  className="mt-8 w-full min-h-[44px] inline-flex items-center justify-center bg-primary text-primary-foreground py-3.5 uppercase tracking-label text-[0.7rem] font-medium hover:bg-primary/90 transition-colors"
                >
                  Book a Session
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}