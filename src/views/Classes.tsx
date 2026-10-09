'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import ClassCard from '@/components/ClassCard';
import Modal from '@/components/Modal';
import { stagger, EASE, fadeUp, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ClassItem, ScheduleSlotItem } from '@/types';

const CATEGORIES = ['All', 'Strength', 'Yoga', 'HIIT', 'Cycling', 'Boxing', 'Pilates'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Classes() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [slots, setSlots] = useState<ScheduleSlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState('All');
  const [day, setDay] = useState('Mon');
  const [selected, setSelected] = useState<ClassItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [classList, slotList] = await Promise.all([
        api.entities.Class.list(),
        api.entities.ScheduleSlot.list(),
      ]);
      setClasses(classList || []);
      setSlots(slotList || []);
    } catch (err) {
      setError('Unable to load classes and schedule. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = active === 'All' ? classes : classes.filter((c) => c.category === active);
  const daySlots = slots
    .filter((s) => s.day === day)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <PageTransition>
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12">
        <SectionHeading
          label="The program"
          title="Every class, a discipline."
          intro="Six categories, forty sessions a week. Filter by what you came to build."
        />
      </section>

      {/* Category tabs */}
      <section className="px-6 md:px-12 pb-10">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border/60 pb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                'min-h-[44px] flex items-center py-2 text-[0.7rem] uppercase tracking-ultra transition-colors relative select-none',
                active === cat ? 'text-primary' : 'text-foreground/50 hover:text-foreground'
              )}
            >
              {cat}
              {active === cat && (
                <motion.span
                  layoutId="cat-underline"
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute -bottom-[21px] left-0 right-0 h-px bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Grid or Skeletons */}
      <section className="px-6 md:px-12 pb-24 min-h-[300px]">
        {error ? (
          <div className="p-8 border border-border/60 text-center max-w-lg mx-auto my-12">
            <AlertCircle className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="text-foreground font-heading text-xl">Connection Notice</p>
            <p className="mt-2 text-foreground/60 text-sm">{error}</p>
            <button
              onClick={fetchData}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 border border-border text-[0.7rem] uppercase tracking-label text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-t border-border/60 pt-6 pb-8 space-y-4 animate-pulse">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="h-12 w-full bg-muted/60 rounded" />
                <div className="h-3 w-32 bg-muted/40 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-border/40">
            <p className="text-foreground/50 text-sm">No sessions currently listed in this category.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4"
          >
            {filtered.map((c) => (
              <ClassCard key={c.id} cls={c} onClick={() => setSelected(c)} />
            ))}
          </motion.div>
        )}
      </section>

      {/* Weekly schedule */}
      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border">
        <SectionHeading label="The week" title="The schedule." />
        <div className="mt-10 flex gap-1 overflow-x-auto no-scrollbar snap-x-mandatory pb-2 touch-pan-x">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={cn(
                'min-w-[64px] min-h-[44px] flex items-center justify-center py-3 text-[0.7rem] uppercase tracking-ultra border-b-2 transition-colors snap-start select-none',
                day === d ? 'border-primary text-primary font-medium' : 'border-border/60 text-foreground/50 hover:text-foreground'
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mt-6 border-t border-border/60">
          <AnimatePresence mode="wait">
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {loading ? (
                <div className="space-y-4 py-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-5 border-b border-border/40 animate-pulse">
                      <div className="flex gap-6 items-center">
                        <div className="h-6 w-16 bg-muted rounded" />
                        <div className="space-y-2">
                          <div className="h-5 w-40 bg-muted rounded" />
                          <div className="h-3 w-28 bg-muted/60 rounded" />
                        </div>
                      </div>
                      <div className="h-9 w-20 bg-muted rounded hidden sm:block" />
                    </div>
                  ))}
                </div>
              ) : daySlots.length === 0 ? (
                <p className="py-12 text-foreground/45 text-sm text-center">No sessions scheduled for {day}.</p>
              ) : (
                daySlots.map((s, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-5 gap-4 border-b border-border/60">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="font-heading text-lg sm:text-xl text-primary w-16 sm:w-20 shrink-0">{s.start_time}</span>
                      <div>
                        <p className="font-heading text-base sm:text-lg text-foreground">{s.class_name}</p>
                        <p className="text-[0.65rem] uppercase tracking-ultra text-foreground/45 mt-1">
                          {s.category} · {s.trainer} · {s.duration} min
                        </p>
                      </div>
                    </div>
                    <a
                      href="/book-tour"
                      className="inline-flex items-center justify-center self-start sm:self-auto min-h-[44px] border border-border px-6 py-2 text-[0.65rem] uppercase tracking-label text-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      Book Tour
                    </a>
                  </div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Class detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <p className="text-[0.6rem] uppercase tracking-ultra text-primary mb-3">
              {selected.category} · {selected.intensity}
            </p>
            <h3 className="font-heading text-3xl sm:text-4xl text-foreground">{selected.name}</h3>
            <p className="mt-5 text-foreground/65 leading-relaxed text-sm sm:text-base max-w-[55ch]">{selected.description}</p>
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/60 pt-6">
              <div>
                <p className="text-[0.6rem] uppercase tracking-ultra text-foreground/45">Duration</p>
                <p className="mt-1 text-foreground text-sm font-medium">{selected.duration} min</p>
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-ultra text-foreground/45">Coach</p>
                <p className="mt-1 text-foreground text-sm font-medium">{selected.trainer}</p>
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-ultra text-foreground/45">Capacity</p>
                <p className="mt-1 text-foreground text-sm font-medium">{selected.capacity}</p>
              </div>
            </div>
            <a
              href="/book-tour"
              className="mt-8 w-full min-h-[44px] inline-flex items-center justify-center bg-primary text-primary-foreground py-3.5 uppercase tracking-label text-[0.7rem] font-medium hover:bg-primary/90 transition-colors"
            >
              Book a Tour
            </a>
          </div>
        )}
      </Modal>
    </PageTransition>
  );
}