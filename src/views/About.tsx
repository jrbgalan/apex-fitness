'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';
import { TrainerItem } from '@/types';

const VALUES = [
  { title: 'Discipline', body: 'We do not sell motivation. We build the quiet habit of showing up every single day.' },
  { title: 'Precision', body: 'Every program is written for one person. No templates, no guesswork, no compromise.' },
  { title: 'Restraint', body: 'No mirrors for ego. No music for distraction. Only the floor, the coach, and the work.' },
];

const TIMELINE = [
  { year: '2017', text: 'Founded as a single-room strength studio in BGC.' },
  { year: '2019', text: 'Opened the cycling and boxing rooms. First hundred members.' },
  { year: '2021', text: 'Moved to the Apex Building. Six thousand square feet.' },
  { year: '2024', text: 'Launched the Private tier and the recovery suite.' },
];

export default function About() {
  const [trainers, setTrainers] = useState<TrainerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.Trainer.list('order', 6)
      .then((res) => setTrainers(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12">
        <SectionHeading
          label="The club"
          title="Apex began with a question."
          intro="What if a gym held you to a standard, instead of selling you an unused membership?"
        />
      </section>

      {/* Story */}
      <section className="px-6 md:px-12 py-12 md:py-20 max-w-4xl">
        <motion.div
          variants={stagger(0.14)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="space-y-6 font-serif text-lg sm:text-xl md:text-2xl text-foreground/85 leading-relaxed max-w-[65ch]"
        >
          <motion.p variants={fadeUp}>
            In 2017, a single room with a barbell and a bench. No mirrors, no music, no franchise playbook — just a coach and a standard.
          </motion.p>
          <motion.p variants={fadeUp}>
            The members who stayed were not looking for convenience. They were looking for a room that took the work seriously. So we built one.
          </motion.p>
          <motion.p variants={fadeUp}>
            Today Apex is six thousand square feet and six disciplines, but the rule is unchanged: we hold the line. You do the rest.
          </motion.p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border/60">
        <SectionHeading label="What we believe" title="Three rules." />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {VALUES.map((v) => (
            <motion.div
              key={v.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="border-t border-border/60 pt-6"
            >
              <h3 className="font-heading text-2xl sm:text-3xl text-primary">{v.title}</h3>
              <p className="mt-4 text-foreground/65 leading-relaxed text-sm sm:text-base max-w-[45ch]">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border/60">
        <SectionHeading label="The road" title="Seven years." />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {TIMELINE.map((t) => (
            <motion.div
              key={t.year}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="border-t border-border/60 pt-6"
            >
              <p className="font-heading text-3xl sm:text-4xl text-foreground">{t.year}</p>
              <p className="mt-4 text-foreground/60 text-sm leading-relaxed max-w-[35ch]">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border/60">
        <SectionHeading label="The team" title="Six specialists." />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 border-t border-border/60">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-b border-border/40 py-5 space-y-2 animate-pulse">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted/60 rounded" />
              </div>
            ))
          ) : (
            trainers.map((t) => (
              <div key={t.id} className="border-b border-border/60 py-5">
                <p className="font-heading text-lg text-foreground">{t.name}</p>
                <p className="text-[0.65rem] uppercase tracking-ultra text-primary mt-1">{t.role}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </PageTransition>
  );
}