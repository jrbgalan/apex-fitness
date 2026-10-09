'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';

export interface AccordionItem {
  q: string;
  a: string;
}

export interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [open, setOpen] = useState(0);

  return (
    <div className="border-t border-border/60">
      {items.map((item, i) => {
        const isOpen = open === i;
        const triggerId = `accordion-trigger-${i}`;
        const panelId = `accordion-panel-${i}`;

        return (
          <div key={i} className="border-b border-border/60">
            <h3>
              <button
                id={triggerId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex items-center justify-between w-full min-h-[44px] py-5 sm:py-6 text-left gap-6 group select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                <span className={cn('font-heading text-lg sm:text-xl md:text-2xl transition-colors duration-300', isOpen ? 'text-primary' : 'text-foreground group-hover:text-primary')}>
                  {item.q}
                </span>
                <Plus className={cn('w-5 h-5 shrink-0 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]', isOpen ? 'rotate-45 text-primary' : 'text-foreground/50 group-hover:text-foreground')} aria-hidden="true" />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-6 sm:pr-10 text-foreground/70 text-sm sm:text-base leading-relaxed max-w-[60ch]">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}