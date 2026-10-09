import { motion } from 'framer-motion';
import { EASE, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

const INTENSITY_DOTS = { Low: 1, Moderate: 2, High: 3, Elite: 4 };

// Minimalist typographic class block. Self-animates on view; expands meta on hover.
export default function ClassCard({ cls, onClick, className, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 3) * 0.08 }}
      onClick={onClick}
      className={cn('group border-t border-border pt-6 pb-8 px-1 w-full transition-colors', onClick && 'cursor-pointer', className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.6rem] uppercase tracking-label text-primary mb-3">{cls.category}</p>
          <h3 className="font-heading text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors duration-500">
            {cls.name}
          </h3>
        </div>
        <div className="flex gap-1.5 mt-2" aria-label={`Intensity ${cls.intensity}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={cn('block w-1.5 h-1.5 rounded-full transition-colors', i < INTENSITY_DOTS[cls.intensity] ? 'bg-primary' : 'bg-border')}
            />
          ))}
        </div>
      </div>
      <p className="mt-4 text-foreground/55 text-sm leading-relaxed max-w-md">{cls.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.65rem] uppercase tracking-label text-foreground/45">
        <span>{cls.duration} min</span><span>·</span>
        <span>{cls.trainer}</span><span>·</span>
        <span>{cls.capacity} spots</span>
      </div>
    </motion.div>
  );
}