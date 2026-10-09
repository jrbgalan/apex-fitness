'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

// Wraps each page with a smooth, snappy entrance transition.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}