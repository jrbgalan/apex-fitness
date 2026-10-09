'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { EASE } from '@/lib/motion';

/**
 * Iconic APEX Brand Welcoming Screen
 * Features theatrical upward curtain reveal, ambient champagne glow,
 * monogram reveal, and immediate click-to-enter skip capability.
 */
export default function Loader() {
  const [done, setDone] = useState(false);

  const handleDismiss = useCallback(() => {
    setDone(true);
  }, []);

  useEffect(() => {
    // Prevent background scrolling during welcoming sequence
    if (!done) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => {
      setDone(true);
    }, reduce ? 350 : 2100);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label="Apex Fitness Gym Welcoming Screen"
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] bg-[#070707] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Subtle ambient champagne gold radial pulse */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_65%)] pointer-events-none" />

          {/* Central Architectural Brand Stack */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Monogram emblem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mb-6 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border border-primary/35 bg-primary/10 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                <span className="font-heading text-lg text-primary font-semibold leading-none">▲</span>
              </div>
            </motion.div>

            {/* Masked APEX logotype entrance */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '120%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                className="font-heading text-5xl sm:text-7xl md:text-8xl tracking-[0.3em] text-foreground font-normal leading-none pl-[0.3em]"
              >
                APEX
              </motion.h1>
            </div>

            {/* Champagne Gold Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
              className="mt-4 text-[0.65rem] sm:text-xs uppercase tracking-ultra text-primary font-mono font-medium"
            >
              Private Members' Club · Manila
            </motion.p>

            {/* Expanding gold horizon line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 0.6 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mt-6"
            />

            {/* Ethos note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="mt-4 text-[0.58rem] sm:text-[0.62rem] uppercase tracking-ultra text-foreground/45 font-mono"
            >
              Beyond Limits
            </motion.div>
          </div>

          {/* Discreet click to enter cue at the bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.55rem] uppercase tracking-ultra text-muted-foreground/40 font-mono pointer-events-none"
          >
            Click anywhere to enter
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}