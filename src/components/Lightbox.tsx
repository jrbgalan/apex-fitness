'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { EASE } from '@/lib/motion';

export interface LightboxProps {
  src: string | null;
  alt?: string;
  credit?: string;
  onClose: () => void;
}

export default function Lightbox({ src, alt, credit, onClose }: LightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!src) return;

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

    // Initial focus on close button
    setTimeout(() => {
      const closeBtn = containerRef.current?.querySelector<HTMLButtonElement>('button');
      closeBtn?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={alt || 'Image lightbox'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 md:p-10"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-foreground/70 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary z-20"
            aria-label="Close image lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative max-w-5xl w-full max-h-[80vh] h-[70vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt || 'Apex facility view'}
              fittingType="fit"
              className="w-full h-full object-contain"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority={true}
            />
          </motion.div>

          {/* Caption & Unsplash credit */}
          <div className="mt-4 text-center z-10 space-y-1">
            {alt && <p className="text-sm text-foreground/90 font-medium">{alt}</p>}
            {credit && (
              <p className="text-xs text-primary/80 font-mono tracking-wider">
                {credit}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
