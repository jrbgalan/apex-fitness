'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';

export default function Accordion({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="border-t border-border">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-border">
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex items-center justify-between w-full py-6 text-left gap-6"
              aria-expanded={isOpen}
            >
              <span className={cn('font-heading text-xl md:text-2xl transition-colors', isOpen ? 'text-primary' : 'text-foreground')}>
                {item.q}
              </span>
              <Plus className={cn('w-5 h-5 shrink-0 transition-transform duration-500', isOpen && 'rotate-45 text-primary')} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-10 text-foreground/60 leading-relaxed max-w-2xl">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}