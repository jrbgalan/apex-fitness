'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from '@/components/Link';
import { Image } from '@/components/ui/image';
import { EASE } from '@/lib/motion';
import { TrainerItem } from '@/types';

export interface TrainerDetailModalProps {
  trainer: TrainerItem | null;
  onClose: () => void;
}

export default function TrainerDetailModal({ trainer, onClose }: TrainerDetailModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!trainer) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    const originalOverflow = window.getComputedStyle(document.body).overflow;
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

    setTimeout(() => {
      const closeBtn = containerRef.current?.querySelector<HTMLButtonElement>('button');
      closeBtn?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [trainer, onClose]);

  return (
    <AnimatePresence>
      {trainer && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Coach profile: ${trainer.name}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed top-0 right-0 bottom-0 z-[71] w-full max-w-md bg-card border-l border-border overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-foreground/70 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary z-10"
              aria-label="Close coach profile"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-[4/5] overflow-hidden bg-background relative">
              <Image
                src={trainer.image_url}
                alt={`${trainer.name}, ${trainer.role}`}
                fittingType="fill"
                sizes="(max-width: 768px) 100vw, 450px"
                className="w-full h-full object-cover"
              />
              {trainer.credit && (
                <span className="absolute bottom-2 right-2 text-[0.62rem] text-foreground/80 bg-background/85 px-2 py-0.5 backdrop-blur-sm border border-border/60">
                  {trainer.credit}
                </span>
              )}
            </div>
            <div className="p-8">
              <p className="text-[0.6rem] uppercase tracking-ultra text-primary mb-2">{trainer.role}</p>
              <h2 className="font-heading text-3xl sm:text-4xl text-foreground">{trainer.name}</h2>
              <p className="mt-4 text-foreground/70 leading-relaxed text-sm max-w-[50ch]">{trainer.bio}</p>
              <div className="mt-6">
                <p className="text-[0.6rem] uppercase tracking-ultra text-foreground/60 mb-3">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties?.map((s) => (
                    <span key={s} className="border border-border/60 px-3 py-1.5 text-xs text-foreground/80">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-6 text-[0.65rem] uppercase tracking-ultra text-foreground/60">
                {trainer.experience_years} years coaching
              </p>
              <Link
                to="/book-tour"
                onClick={onClose}
                className="mt-8 w-full min-h-[44px] inline-flex items-center justify-center bg-primary text-primary-foreground py-3.5 uppercase tracking-label text-[0.7rem] font-medium hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
              >
                Book a Session
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

