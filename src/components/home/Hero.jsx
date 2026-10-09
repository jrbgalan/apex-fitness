'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from '@/components/Link';
import { Image } from '@/components/ui/image';
import { EASE, lineReveal } from '@/lib/motion';

const HERO_IMG = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1400&auto=format&fit=crop';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <Image
          src={HERO_IMG}
          alt="The Apex training floor at night, lit by a single warm light"
          fittingType="fill"
          className="w-full h-full object-cover animate-kenburns"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/40" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 pb-24 md:pb-32"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3, duration: 0.8 }}
          className="text-[0.65rem] uppercase tracking-ultra text-primary mb-6"
        >
          Manila · Private Members' Club
        </motion.p>
        <h1
          className="font-heading text-foreground leading-[0.92] tracking-tightest"
          style={{ fontSize: 'clamp(3.5rem, 13vw, 11rem)' }}
        >
          <span className="block overflow-hidden">
            <motion.span
              variants={lineReveal}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.9, duration: 1, ease: EASE }}
              className="block"
            >
              BEYOND
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              variants={lineReveal}
              initial="hidden"
              animate="visible"
              transition={{ delay: 2.1, duration: 1, ease: EASE }}
              className="block ghost-text"
            >
              LIMITS
            </motion.span>
          </span>
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7, duration: 0.8, ease: EASE }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/book-tour"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 uppercase tracking-label text-[0.7rem] hover:bg-primary/90 transition-colors"
          >
            Book a Tour
          </Link>
          <Link
            to="/membership"
            className="inline-flex items-center justify-center border border-border text-foreground px-8 py-4 uppercase tracking-label text-[0.7rem] hover:border-primary hover:text-primary transition-colors"
          >
            View Membership
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[0.55rem] uppercase tracking-ultra text-foreground/45">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="block w-px h-10 bg-primary/50"
        />
      </motion.div>
    </section>
  );
}