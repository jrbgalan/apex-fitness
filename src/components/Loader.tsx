'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EASE } from '@/lib/motion';

// Brand logo loader -> curtain reveal into the page once per session.
export default function Loader() {
  const [done, setDone] = useState(true);

  useEffect(() => {
    // Only display once per browser session
    try {
      const alreadyShown = sessionStorage.getItem('apex_intro_shown');
      if (alreadyShown) {
        setDone(true);
        return;
      }
      setDone(false);
      sessionStorage.setItem('apex_intro_shown', 'true');

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const t = setTimeout(() => setDone(true), reduce ? 200 : 700);
      return () => clearTimeout(t);
    } catch {
      setDone(true);
    }
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label="Loading Apex Fitness Gym"
          onClick={() => setDone(true)}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center cursor-pointer select-none"
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="text-center overflow-hidden">
            <motion.div
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
              className="font-heading text-5xl md:text-6xl tracking-[0.25em] text-foreground"
            >
              APEX
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-4 text-[0.6rem] uppercase tracking-ultra text-primary"
            >
              Fitness Gym
            </motion.div>
          </div>
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 h-px bg-primary"
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}