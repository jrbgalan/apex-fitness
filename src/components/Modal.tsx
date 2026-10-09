'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

// Generic centered modal with backdrop + EASE content reveal.
export default function Modal({ open, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      const original = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8 overflow-y-auto"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn('relative z-10 w-full max-w-2xl bg-card border border-border/60 p-6 sm:p-8 md:p-10 my-auto shadow-2xl', className)}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-foreground/60 hover:text-primary transition-colors select-none"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}