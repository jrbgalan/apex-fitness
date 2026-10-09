'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import ClassCard from '@/components/ClassCard';
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/Modal'), { ssr: false });
import { stagger, EASE, fadeUp, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import { ClassItem, ScheduleSlotItem } from '@/types';
import Link from '@/components/Link';

const CATEGORIES = ['All', 'Strength', 'HIIT', 'Cycling', 'Pilates', 'Yoga', 'Boxing', 'Recovery'];
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
        api.entities.Classes.list(),
        api.entities.ScheduleSlots.list(),
      ]);
      setClasses(classList || []);
      setSlots(slotList || []);
    } catch {
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
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12 max-w-7xl 3xl:max-w-[1700px] 4k:max-w-[2200px] mx-auto">
        <SectionHeading
          label="The Program"
          title="Every class, a discipline."
          intro="16 specialist protocols across 8 athletic categories, scheduled throughout all seven days. Filter by what you came to build."
        />
      </section>

      {/* Category tabs */}
      <section className="px-6 md:px-12 pb-10 max-w-7xl 3xl:max-w-[1700px] 4k:max-w-[2200px] mx-auto">
        <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full pb-3 border-b border-border/60 snap-x-mandatory">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                'min-h-[44px] px-4 py-2 text-xs uppercase tracking-ultra transition-all select-none whitespace-nowrap shrink-0 snap-center border',
                active === cat
                  ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'border-border/60 bg-card/60 text-foreground/70 hover:text-foreground hover:border-border'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid or Skeletons */}
      <section className="px-6 md:px-12 pb-24 min-h-[300px] max-w-7xl 3xl:max-w-[1700px] 4k:max-w-[2200px] mx-auto content-visibility-auto">
        {error ? (
          <div className="p-8 border border-border/60 text-center max-w-lg mx-auto my-12 bg-card">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border/60 bg-card/40 p-4 space-y-4 animate-pulse">
                <div className="aspect-[16/10] w-full bg-muted/60" />
                <div className="h-4 w-20 bg-muted" />
                <div className="h-6 w-48 bg-muted" />
                <div className="h-10 w-full bg-muted/50" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-border/40 bg-card">
            <p className="text-foreground/50 text-sm">No sessions currently listed in this category.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((c, idx) => (
              <ClassCard
                key={c.id}
                cls={c}
                index={idx}
                onClick={() => setSelected(c)}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Weekly schedule */}
      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border max-w-7xl 3xl:max-w-[1700px] 4k:max-w-[2200px] mx-auto content-visibility-auto">
        <SectionHeading label="The Week" title="The master schedule." intro="Live weekly class times across our training studios." />
        <div className="mt-10 flex gap-2 overflow-x-auto no-scrollbar snap-x-mandatory pb-2 touch-pan-x">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={cn(
                'min-w-[64px] min-h-[44px] flex items-center justify-center py-2.5 px-4 text-xs uppercase tracking-ultra border transition-all snap-start select-none font-medium',
                day === d
                  ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'border-border/60 bg-card/60 text-foreground/60 hover:text-foreground'
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mt-8 border border-border/60 bg-card divide-y divide-border/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="divide-y divide-border/40"
            >
              {loading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-4 animate-pulse">
                      <div className="flex gap-6 items-center">
                        <div className="h-6 w-16 bg-muted rounded" />
                        <div className="space-y-2">
                          <div className="h-5 w-40 bg-muted rounded" />
                          <div className="h-3 w-28 bg-muted/60 rounded" />
                        </div>
                      </div>
                      <div className="h-9 w-24 bg-muted rounded hidden sm:block" />
                    </div>
                  ))}
                </div>
              ) : daySlots.length === 0 ? (
                <p className="py-12 text-foreground/45 text-sm text-center">No sessions scheduled for {day}.</p>
              ) : (
                daySlots.map((s, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="font-mono text-lg sm:text-xl text-primary font-semibold w-16 sm:w-20 shrink-0">
                        {s.start_time}
                      </span>
                      <div>
                        <p className="font-heading text-base sm:text-lg text-foreground font-medium">{s.class_name}</p>
                        <p className="text-[0.68rem] uppercase tracking-ultra text-foreground/60 mt-1 font-mono">
                          {s.category} · {s.trainer} · {s.spots_remaining || 8} spots left
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/book-tour?interest=${encodeURIComponent(s.class_name)}`}
                      className="inline-flex items-center justify-center self-start sm:self-auto min-h-[44px] border border-border px-6 py-2 text-xs uppercase tracking-label text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-medium"
                    >
                      Book Tour
                    </Link>
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
            {(selected.image || selected.image_url) && (
              <div className="relative aspect-[16/9] w-full mb-6 overflow-hidden border border-border/60">
                <Image
                  src={selected.image || selected.image_url || ''}
                  alt={selected.name}
                  fill
                  sizes="600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-background/20" />
                {selected.credit && (
                  <span className="absolute bottom-2 right-2 text-[0.62rem] text-foreground/80 bg-background/80 px-2 py-0.5 backdrop-blur-sm">
                    {selected.credit}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[0.65rem] uppercase tracking-ultra text-primary font-mono">
                {selected.category}
              </span>
              <span>·</span>
              <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-mono">
                Level: {selected.level || 'All Levels'}
              </span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl text-foreground">{selected.name}</h3>
            <p className="mt-4 text-foreground/75 leading-relaxed text-sm sm:text-base">{selected.description}</p>
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/60 pt-6 text-center">
              <div>
                <p className="text-[0.6rem] uppercase tracking-ultra text-foreground/45">Duration</p>
                <p className="mt-1 text-foreground text-sm font-medium font-mono">{selected.duration} min</p>
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-ultra text-foreground/45">Coach</p>
                <p className="mt-1 text-foreground text-sm font-medium">{selected.trainer}</p>
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-ultra text-foreground/45">Capacity</p>
                <p className="mt-1 text-foreground text-sm font-medium font-mono">{selected.capacity} spots</p>
              </div>
            </div>
            <Link
              to={`/book-tour?interest=${encodeURIComponent(selected.name)}`}
              className="mt-8 w-full min-h-[46px] inline-flex items-center justify-center bg-primary text-primary-foreground py-3.5 uppercase tracking-label text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Book a Tour For This Class
            </Link>
          </div>
        )}
      </Modal>
    </PageTransition>
  );
}