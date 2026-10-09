'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import ClassCard from '@/components/ClassCard';
import Modal from '@/components/Modal';
import { stagger, EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Strength', 'Yoga', 'HIIT', 'Cycling', 'Boxing', 'Pilates'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [slots, setSlots] = useState([]);
  const [active, setActive] = useState('All');
  const [day, setDay] = useState('Mon');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.entities.Class.list().then(setClasses).catch(() => {});
    api.entities.ScheduleSlot.list().then(setSlots).catch(() => {});
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
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                'py-1 text-[0.7rem] uppercase tracking-label transition-colors relative',
                active === cat ? 'text-primary' : 'text-foreground/50 hover:text-foreground'
              )}
            >
              {cat}
              {active === cat && (
                <motion.span layoutId="cat-underline" className="absolute -bottom-[21px] left-0 right-0 h-px bg-primary" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-12 pb-24">
        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2"
        >
          {filtered.map((c) => (
            <ClassCard key={c.id} cls={c} onClick={() => setSelected(c)} />
          ))}
        </motion.div>
      </section>

      {/* Weekly schedule */}
      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border">
        <SectionHeading label="The week" title="The schedule." />
        <div className="mt-10 flex gap-1 overflow-x-auto no-scrollbar pb-2">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={cn(
                'min-w-[64px] py-3 text-[0.7rem] uppercase tracking-label border-b-2 transition-colors',
                day === d ? 'border-primary text-primary' : 'border-border text-foreground/50 hover:text-foreground'
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mt-6 border-t border-border">
          <AnimatePresence mode="wait">
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {daySlots.length === 0 && (
                <p className="py-8 text-foreground/40 text-sm">No sessions scheduled.</p>
              )}
              {daySlots.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-5 gap-4 border-b border-border">
                  <div className="flex items-center gap-6">
                    <span className="font-heading text-xl text-primary w-20">{s.start_time}</span>
                    <div>
                      <p className="font-heading text-lg text-foreground">{s.class_name}</p>
                      <p className="text-[0.65rem] uppercase tracking-label text-foreground/45 mt-1">
                        {s.category} · {s.trainer} · {s.duration} min
                      </p>
                    </div>
                  </div>
                  <a
                    href="/book-tour"
                    className="hidden sm:inline-flex border border-border px-5 py-2.5 text-[0.65rem] uppercase tracking-label text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    Book
                  </a>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Class detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <p className="text-[0.6rem] uppercase tracking-label text-primary mb-3">
              {selected.category} · {selected.intensity}
            </p>
            <h3 className="font-heading text-4xl text-foreground">{selected.name}</h3>
            <p className="mt-5 text-foreground/65 leading-relaxed">{selected.description}</p>
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
              <div>
                <p className="text-[0.6rem] uppercase tracking-label text-foreground/45">Duration</p>
                <p className="mt-1 text-foreground">{selected.duration} min</p>
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-label text-foreground/45">Coach</p>
                <p className="mt-1 text-foreground">{selected.trainer}</p>
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-label text-foreground/45">Capacity</p>
                <p className="mt-1 text-foreground">{selected.capacity}</p>
              </div>
            </div>
            <a
              href="/book-tour"
              className="mt-8 w-full inline-flex justify-center bg-primary text-primary-foreground py-4 uppercase tracking-label text-[0.7rem] hover:bg-primary/90 transition-colors"
            >
              Book a Tour
            </a>
          </div>
        )}
      </Modal>
    </PageTransition>
  );
}