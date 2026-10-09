'use client';
import { cn } from '@/lib/utils';

export interface MarqueeProps {
  items: string[];
  className?: string;
}

// Infinite horizontal marquee. Content is duplicated; CSS animates -50%.
export default function Marquee({ items, className }: MarqueeProps) {
  return (
    <div className={cn('overflow-hidden w-full max-w-full whitespace-nowrap select-none pointer-events-none', className)}>
      <div className="inline-flex animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="font-heading text-3xl sm:text-4xl md:text-6xl text-foreground/20 px-6 sm:px-8">{item}</span>
            <span className="text-primary text-xl sm:text-2xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}