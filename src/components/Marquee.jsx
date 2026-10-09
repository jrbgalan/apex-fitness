import { cn } from '@/lib/utils';

// Infinite horizontal marquee. Content is duplicated; CSS animates -50%.
export default function Marquee({ items, className }) {
  return (
    <div className={cn('overflow-hidden whitespace-nowrap select-none', className)}>
      <div className="inline-flex animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="font-heading text-4xl md:text-6xl text-foreground/25 px-8">{item}</span>
            <span className="text-primary text-2xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}