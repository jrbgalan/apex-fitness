'use client';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { EASE, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

import { TrainerItem } from '@/types';

export interface TrainerCardProps {
  trainer: TrainerItem;
  onClick?: () => void;
  className?: string;
  index?: number;
}

// Editorial portrait card with hover reveal of specialties. Self-animates on view.
export default function TrainerCard({ trainer, onClick, className, index = 0 }: TrainerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 3) * 0.08 }}
      onClick={onClick}
      className={cn('group relative w-full overflow-hidden bg-card border border-border/40 hover:border-primary/40 transition-colors duration-500', onClick && 'cursor-pointer select-none', className)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-card">
        <Image
          src={trainer.image_url}
          alt={`${trainer.name}, ${trainer.role}`}
          fittingType="fill"
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 pointer-events-none">
        <p className="text-[0.6rem] uppercase tracking-ultra text-primary mb-2">{trainer.role}</p>
        <h3 className="font-heading text-xl md:text-2xl text-foreground">{trainer.name}</h3>
        <div className="overflow-hidden mt-1.5">
          <p className="text-foreground/60 text-xs translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
            {trainer.specialties?.join(' · ')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}