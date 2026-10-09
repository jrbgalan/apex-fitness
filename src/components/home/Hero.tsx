'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Link from '@/components/Link';
import { Image } from '@/components/ui/image';
import { EASE, lineReveal } from '@/lib/motion';

const HERO_IMG = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1400&auto=format&fit=crop';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const rawY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const y = shouldReduceMotion ? '0%' : rawY;
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const lineVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : lineReveal;

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <Image
          src={HERO_IMG}
          alt="The Apex training floor at night, lit by a single warm light"
          fittingType="fill"
          priority={true}
          sizes="100vw"
          className="w-full h-full object-cover animate-kenburns"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/40" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 pb-24 md:pb-32 max-w-7xl 3xl:max-w-[1700px] 4k:max-w-[2200px] mx-auto w-full"
      >
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.2, duration: 0.7, ease: EASE }}
          className="text-[0.65rem] uppercase tracking-ultra text-primary mb-6"
        >
          Manila · Private Members' Club
        </motion.p>
        <h1
          className="font-heading text-foreground leading-[0.92] tracking-tightest"
          style={{ fontSize: 'clamp(3.5rem, 13vw, 11rem)' }}
        >
          <span className="block overflow-hidden pb-1">
            <motion.span
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: shouldReduceMotion ? 0 : 0.35, duration: 1, ease: EASE }}
              className="block"
            >
              BEYOND
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-1">
            <motion.span
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: shouldReduceMotion ? 0 : 0.55, duration: 1, ease: EASE }}
              className="block ghost-text"
            >
              LIMITS
            </motion.span>
          </span>
        </h1>
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.8, duration: 0.8, ease: EASE }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/book-tour"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] bg-primary text-primary-foreground px-8 py-4 uppercase tracking-label text-[0.7rem] hover:bg-primary/90 transition-colors"
          >
            Book a Tour
          </Link>
          <Link
            to="/membership"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] border border-border text-foreground px-8 py-4 uppercase tracking-label text-[0.7rem] hover:border-primary hover:text-primary transition-colors"
          >
            View Membership
          </Link>
        </motion.div>
      </motion.div>

      {!shouldReduceMotion && (
        <motion.div
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-[0.55rem] uppercase tracking-ultra text-foreground/45">Scroll</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="block w-px h-10 bg-primary/50"
          />
        </motion.div>
      )}
    </section>
  );
}