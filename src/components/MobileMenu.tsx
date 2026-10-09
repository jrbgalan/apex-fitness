'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from '@/components/Link';
import { X } from 'lucide-react';
import { EASE } from '@/lib/motion';

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: Array<{ label: string; to: string }>;
}

// Full-screen slide-in menu with staggered link animation & body scroll lock.
export default function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed inset-0 z-[60] bg-background flex flex-col md:hidden overflow-y-auto"
        >
          {/* Header bar with always reachable close button */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 h-20 bg-background/95 backdrop-blur-md border-b border-border/40 shrink-0">
            <span className="font-heading text-xl tracking-[0.25em]">APEX</span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] -mr-2 text-foreground hover:text-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col px-6 py-8" aria-label="Mobile">
            {links.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: EASE }}
              >
                <Link
                  to={l.to}
                  onClick={onClose}
                  className="flex items-center min-h-[52px] py-3 font-heading text-3xl sm:text-4xl text-foreground border-b border-border/60 hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="mt-auto p-6 shrink-0">
            <Link
              to="/book-tour"
              onClick={onClose}
              className="flex items-center justify-center w-full min-h-[44px] bg-primary text-primary-foreground py-4 uppercase tracking-label text-[0.7rem] font-medium hover:bg-primary/90 transition-colors"
            >
              Book a Tour
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}