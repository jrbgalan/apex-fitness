import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EASE } from '@/lib/motion';

// Brand logo loader -> curtain reveal into the page.
export default function Loader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setDone(true), reduce ? 400 : 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
          exit={{ y: '-100%' }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="text-center overflow-hidden">
            <motion.div
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.1 }}
              className="font-heading text-5xl md:text-6xl tracking-[0.25em] text-foreground"
            >
              APEX
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-4 text-[0.6rem] uppercase tracking-ultra text-primary"
            >
              Fitness Gym
            </motion.div>
          </div>
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 h-px bg-primary"
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}