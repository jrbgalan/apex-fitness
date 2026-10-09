'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from '@/components/Link';
import { X } from 'lucide-react';
import { EASE } from '@/lib/motion';

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: Array<{ label: string; to: string }>;
}

// Full-screen slide-in menu with focus trap, Escape handling, staggered link animation & body scroll lock.
export default function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on close button
    setTimeout(() => {
      const closeBtn = containerRef.current?.querySelector<HTMLButtonElement>('button');
      closeBtn?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
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
              aria-label="Close navigation menu"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] -mr-2 text-foreground hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col px-6 py-8" aria-label="Mobile Navigation">
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
                  className="flex items-center min-h-[52px] py-3 font-heading text-3xl sm:text-4xl text-foreground border-b border-border/60 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary"
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
              className="flex items-center justify-center w-full min-h-[44px] bg-primary text-primary-foreground py-4 uppercase tracking-label text-[0.7rem] font-medium hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            >
              Book a Tour
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}