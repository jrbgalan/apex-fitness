'use client';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { EASE, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Editorial portrait card with hover reveal of specialties. Self-animates on view.
export default function TrainerCard({ trainer, onClick, className, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 3) * 0.08 }}
      onClick={onClick}
      className={cn('group relative w-full overflow-hidden bg-card', onClick && 'cursor-pointer', className)}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <Image
          src={trainer.image_url}
          alt={`${trainer.name}, ${trainer.role}`}
          fittingType="fill"
          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-5 md:p-6">
        <p className="text-[0.6rem] uppercase tracking-label text-primary mb-2">{trainer.role}</p>
        <h3 className="font-heading text-xl md:text-2xl text-foreground">{trainer.name}</h3>
        <div className="overflow-hidden mt-1.5">
          <p className="text-foreground/55 text-xs translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            {trainer.specialties?.join(' · ')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}