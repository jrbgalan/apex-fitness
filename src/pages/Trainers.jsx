import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { Image } from '@/components/ui/image';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import TrainerCard from '@/components/TrainerCard';
import { stagger, viewportOnce, EASE } from '@/lib/motion';

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.entities.Trainer.list('order', 6).then(setTrainers).catch(() => {});
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

      <section className="px-6 md:px-12 pb-24">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        >
          {trainers.map((t) => (
            <TrainerCard key={t.id} trainer={t} onClick={() => setSelected(t)} />
          ))}
        </motion.div>
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
                className="absolute top-5 right-5 p-2 text-foreground/70 hover:text-primary z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-[4/5] overflow-hidden">
                <Image
                  src={selected.image_url}
                  alt={`${selected.name}, ${selected.role}`}
                  fittingType="fill"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <p className="text-[0.6rem] uppercase tracking-label text-primary mb-2">{selected.role}</p>
                <h2 className="font-heading text-4xl text-foreground">{selected.name}</h2>
                <p className="mt-4 text-foreground/60 leading-relaxed">{selected.bio}</p>
                <div className="mt-6">
                  <p className="text-[0.6rem] uppercase tracking-label text-foreground/45 mb-3">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.specialties?.map((s) => (
                      <span key={s} className="border border-border px-3 py-1.5 text-xs text-foreground/70">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-6 text-[0.65rem] uppercase tracking-label text-foreground/45">
                  {selected.experience_years} years coaching
                </p>
                <Link
                  to="/book-tour"
                  onClick={() => setSelected(null)}
                  className="mt-8 w-full inline-flex justify-center bg-primary text-primary-foreground py-4 uppercase tracking-label text-[0.7rem] hover:bg-primary/90 transition-colors"
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