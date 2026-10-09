'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';

export default function SectionHeading({ label, title, intro, align = 'left', className }) {
  return (
    <motion.div
      variants={stagger(0.14)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}
    >
      {label && (
        <motion.p variants={fadeUp} className="text-[0.65rem] uppercase tracking-label text-primary mb-5">
          {label}
        </motion.p>
      )}
      <motion.h2
        variants={fadeUp}
        className="font-heading text-4xl md:text-6xl text-foreground leading-[1.05] tracking-tightest"
      >
        {title}
      </motion.h2>
      {intro && (
        <motion.p variants={fadeUp} className="mt-6 text-foreground/65 text-lg leading-relaxed font-body">
          {intro}
        </motion.p>
      )}
    </motion.div>
  );
}