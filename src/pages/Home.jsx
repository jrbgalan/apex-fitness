import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '@/api/client';
import { Image } from '@/components/ui/image';
import Hero from '@/components/home/Hero';
import SectionHeading from '@/components/SectionHeading';
import ClassCard from '@/components/ClassCard';
import TrainerCard from '@/components/TrainerCard';
import Marquee from '@/components/Marquee';
import CountUp from '@/components/CountUp';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';

const FACILITIES_IMG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1400&auto=format&fit=crop';
const HERO_IMG = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1400&auto=format&fit=crop';

const STATS = [
  { value: 12, suffix: '', label: 'Specialist coaches' },
  { value: 40, suffix: '+', label: 'Weekly classes' },
  { value: 6000, suffix: '', label: 'Square feet' },
  { value: 24, suffix: '/7', label: 'Member access' },
];

const TESTIMONIALS = [
  { quote: 'Apex rebuilt the way I train. The standard here is unlike anything in the city.', name: 'C. Mendoza', role: 'Member since 2021' },
  { quote: 'I came for the equipment. I stayed for the coaching.', name: 'R. Santos', role: 'Member since 2022' },
  { quote: 'The most disciplined hour of my day, every day.', name: 'J. Lim', role: 'Member since 2020' },
];

export default function Home() {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    api.entities.Class.list().then(setClasses).catch(() => {});
    api.entities.Trainer.list('order', 6).then(setTrainers).catch(() => {});
  }, []);

  return (
    <>
      <Hero />

      {/* Intro statement */}
      <section className="px-6 md:px-12 py-20 md:py-32">
        <div className="max-w-5xl">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="text-[0.65rem] uppercase tracking-ultra text-primary mb-8"
          >
            The philosophy
          </motion.p>
          <motion.h2
            variants={stagger(0.18)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-heading text-3xl md:text-5xl lg:text-6xl text-foreground leading-[1.15] tracking-tight"
          >
            <motion.span variants={fadeUp} className="block">Strength is not a service.</motion.span>
            <motion.span variants={fadeUp} className="block text-foreground/40">It is a standard you are held to —</motion.span>
            <motion.span variants={fadeUp} className="block">quietly, daily, without compromise.</motion.span>
          </motion.h2>
        </div>
      </section>

      {/* Featured facilities */}
      <section className="px-6 md:px-12 pb-20 md:pb-32">
        <SectionHeading
          label="The space"
          title="Built for the work."
          intro="Six thousand square feet of concrete, steel, and silence. Every surface chosen for a reason."
        />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[HERO_IMG, FACILITIES_IMG].map((img, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="group relative overflow-hidden aspect-[4/3] md:aspect-[4/5]"
            >
              <Image
                src={img}
                alt={i === 0 ? 'The Apex training floor' : 'The Apex studio'}
                fittingType="fill"
                className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-0 p-6 md:p-8">
                <p className="text-[0.6rem] uppercase tracking-label text-primary">{i === 0 ? 'The Floor' : 'The Studio'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Class categories carousel */}
      <section className="py-20 md:py-32 overflow-hidden">
        <div className="px-6 md:px-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading label="The program" title="Classes, choreographed." />
          <Link
            to="/classes"
            className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-label text-primary hover:text-foreground transition-colors group"
          >
            All classes
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="mt-12 flex gap-6 overflow-x-auto no-scrollbar snap-x-mandatory px-6 md:px-12 pb-4">
          {classes.map((c) => (
            <Link
              key={c.id}
              to="/classes"
              className="min-w-[280px] md:min-w-[340px] snap-center-item block"
            >
              <ClassCard cls={c} />
            </Link>
          ))}
        </div>
      </section>

      {/* Trainer highlights */}
      <section className="px-6 md:px-12 py-20 md:py-32">
        <SectionHeading
          label="The people"
          title="Coaches, not instructors."
          intro="Specialists who have built careers on one discipline. You train with the best in their field."
        />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {trainers.slice(0, 3).map((t) => (
            <Link key={t.id} to="/trainers" className="block">
              <TrainerCard trainer={t} />
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Link
            to="/trainers"
            className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-label text-primary hover:text-foreground transition-colors group"
          >
            Meet the team
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="text-center md:text-left"
            >
              <div className="font-heading text-4xl md:text-6xl text-foreground">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-[0.6rem] uppercase tracking-label text-foreground/50">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <Marquee items={['Discipline', 'Strength', 'Precision', 'Recovery', 'Standard', 'Apex']} />
        <div className="mt-16 px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="border-l border-primary pl-6"
            >
              <p className="font-serif text-xl md:text-2xl text-foreground/90 italic leading-relaxed">
                “{t.quote}”
              </p>
              <footer className="mt-4 text-[0.65rem] uppercase tracking-label text-foreground/50">
                {t.name} · {t.role}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 py-24 md:py-40 text-center">
        <motion.div
          variants={stagger(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="max-w-3xl mx-auto"
        >
          <motion.p variants={fadeUp} className="text-[0.65rem] uppercase tracking-ultra text-primary mb-6">
            Begin
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl md:text-7xl text-foreground leading-[1.05] tracking-tightest"
          >
            The first session is the hardest. Book it anyway.
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book-tour"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-10 py-4 uppercase tracking-label text-[0.7rem] hover:bg-primary/90 transition-colors"
            >
              Book a Tour
            </Link>
            <Link
              to="/membership"
              className="inline-flex items-center justify-center border border-border text-foreground px-10 py-4 uppercase tracking-label text-[0.7rem] hover:border-primary hover:text-primary transition-colors"
            >
              View Membership
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}