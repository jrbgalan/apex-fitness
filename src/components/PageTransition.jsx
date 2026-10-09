'use client';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion';

// Wraps each page with a smooth fade/slide transition (paired with AnimatePresence in App.jsx).
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}