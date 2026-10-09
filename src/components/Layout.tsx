'use client';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import Cursor from './Cursor';
import Loader from './Loader';
import StickyCTA from './StickyCTA';
import { EASE } from '@/lib/motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <Loader />
      <Cursor />
      <Header />
      <main className="min-h-screen pb-24 md:pb-0 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -14 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}