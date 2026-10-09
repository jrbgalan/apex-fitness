'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';

export interface SectionHeadingProps {
  label?: string;
  title: string;
  intro?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export default function SectionHeading({ label, title, intro, align = 'left', className }: SectionHeadingProps) {
  return (
    <motion.div
      variants={stagger(0.12)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}
    >
      {label && (
        <motion.p variants={fadeUp} className="text-[0.65rem] uppercase tracking-ultra text-primary mb-4">
          {label}
        </motion.p>
      )}
      <motion.h2
        variants={fadeUp}
        className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.08] tracking-tightest break-words"
      >
        {title}
      </motion.h2>
      {intro && (
        <motion.p variants={fadeUp} className="mt-5 text-foreground/65 text-base md:text-lg leading-relaxed font-body max-w-[60ch]">
          {intro}
        </motion.p>
      )}
    </motion.div>
  );
}