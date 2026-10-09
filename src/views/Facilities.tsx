'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

const Lightbox = dynamic(() => import('@/components/Lightbox'), { ssr: false });

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop', alt: 'Main strength conditioning floor and Olympic platforms' },
  { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop', alt: 'Free weights arena and power racks' },
  { src: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200&auto=format&fit=crop', alt: 'Cardio endurance and conditioning section' },
  { src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop', alt: 'Specialized isolation machinery and resistance racks' },
  { src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop', alt: 'Mobility and mind-body movement studio' },
  { src: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1200&auto=format&fit=crop', alt: 'Combat arts sparring ring and training bags' },
];

const AMENITIES = [
  'Strength floor', 'Cardio studio', 'Cycling room', 'Boxing ring',
  'Yoga studio', 'Recovery suite', 'Steam & sauna', 'Private studios',
  'Lounge & café', 'Towel service', 'Secure lockers', '24/7 access',
];

const HOURS = [
  { day: 'Monday — Friday', time: '5:00 — 23:00' },
  { day: 'Saturday', time: '6:00 — 21:00' },
  { day: 'Sunday', time: '7:00 — 20:00' },
  { day: 'Holidays', time: 'Reduced hours' },
];

export default function Facilities() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <PageTransition>
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12">
        <SectionHeading
          label="The space"
          title="A room with intent."
          intro="Every square foot earns its place. Nothing decorative, nothing wasted."
        />
      </section>

      {/* Gallery */}
      <section className="px-6 md:px-12 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY.map((item, i) => (
            <motion.button
              key={item.src}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              onClick={() => setLightbox(item)}
              aria-label={`Enlarge photo: ${item.alt}`}
              className={cn(
                'group relative overflow-hidden bg-card border border-border/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                i === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : 'aspect-square'
              )}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fittingType="fill"
                sizes={i === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 50vw, 33vw'}
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-background/25 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border/60">
        <SectionHeading label="Included" title="The amenities." />
        <motion.div
          variants={stagger(0.04)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-x-8 border-t border-border/60"
        >
          {AMENITIES.map((a) => (
            <motion.div
              key={a}
              variants={fadeUp}
              className="flex items-center gap-3 border-b border-border/60 py-4 min-h-[44px]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-foreground/80 text-sm sm:text-base">{a}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Hours + location */}
      <section className="px-6 md:px-12 py-20 md:py-32 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <SectionHeading label="Visit" title="Hours." />
          <div className="mt-8 border-t border-border/60">
            {HOURS.map((h) => (
              <div key={h.day} className="flex justify-between border-b border-border/60 py-4 text-sm sm:text-base">
                <span className="text-foreground/70">{h.day}</span>
                <span className="text-foreground font-medium">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading label="Find us" title="The address." />
          <p className="mt-8 text-foreground/70 leading-relaxed text-sm sm:text-base max-w-[50ch]">
            8F, The Apex Building<br />
            9th Avenue, Bonifacio Global District<br />
            Taguig, Metro Manila
          </p>
          <div className="mt-8 aspect-[4/3] bg-card border border-border/60 flex items-center justify-center text-foreground/60 text-xs sm:text-sm tracking-widest uppercase">
            Map · 14.5547° N, 121.0504° E
          </div>
        </div>
      </section>

      {/* Dynamic Lightbox */}
      <Lightbox
        src={lightbox?.src || null}
        alt={lightbox?.alt}
        onClose={() => setLightbox(null)}
      />
    </PageTransition>
  );
}