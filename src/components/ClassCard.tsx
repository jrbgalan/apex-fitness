'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { EASE, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { ClassItem } from '@/types';

const INTENSITY_DOTS: Record<string, number> = { Low: 1, Moderate: 2, High: 3, Elite: 4 };

export interface ClassCardProps {
  cls: ClassItem;
  onClick?: () => void;
  className?: string;
  index?: number;
}

export default function ClassCard({ cls, onClick, className, index = 0 }: ClassCardProps) {
  const imageUrl = cls.image || cls.image_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 3) * 0.08 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'group flex flex-col bg-card border border-border/70 hover:border-border transition-all duration-300 overflow-hidden text-left focus-visible:ring-2 focus-visible:ring-primary',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Photo with subtle dark overlay */}
      {imageUrl && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary/40">
          <Image
            src={imageUrl}
            alt={cls.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent pointer-events-none" />

          {/* Level badge */}
          {cls.level && (
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[0.6rem] uppercase tracking-wider font-mono font-medium px-2 py-0.5 bg-background/85 border border-border/80 text-foreground/90 backdrop-blur-sm">
                {cls.level}
              </span>
            </div>
          )}

          {/* Intensity Indicator */}
          <div
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border/60"
            aria-label={`Intensity: ${cls.intensity}`}
          >
            <span className="text-[0.58rem] uppercase font-mono tracking-wider text-muted-foreground">
              {cls.intensity}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'block w-1.5 h-1.5 rounded-full transition-colors',
                    i < (INTENSITY_DOTS[cls.intensity] || 2) ? 'bg-primary' : 'bg-border'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Class Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-[0.62rem] uppercase tracking-ultra text-primary font-mono mb-1.5">
            {cls.category}
          </p>
          <h3 className="font-heading text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors duration-300">
            {cls.name}
          </h3>
          <p className="mt-2.5 text-foreground/70 text-xs sm:text-sm leading-relaxed line-clamp-2">
            {cls.description}
          </p>
        </div>

        <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-[0.68rem] text-muted-foreground uppercase font-mono tracking-wider">
          <div className="flex items-center gap-2">
            <span>{cls.duration} min</span>
            <span>·</span>
            <span className="text-foreground/90 font-medium">{cls.trainer}</span>
          </div>
          <span className="text-primary">{cls.capacity} spots</span>
        </div>
      </div>
    </motion.div>
  );
}