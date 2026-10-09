'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { INITIAL_FACILITY_PHOTOS } from '@/data/mockData';
import { FacilityPhoto } from '@/types';

const Lightbox = dynamic(() => import('@/components/Lightbox'), { ssr: false });

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
  const [lightbox, setLightbox] = useState<FacilityPhoto | null>(null);

  return (
    <PageTransition>
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12">
        <SectionHeading
          label="The Space"
          title="A room with intent."
          intro="12 curated facility viewpoints. Every square foot earns its place. Nothing decorative, nothing wasted."
        />
      </section>

      {/* Gallery (12+ photos with lightbox) */}
      <section className="px-6 md:px-12 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {INITIAL_FACILITY_PHOTOS.map((item, i) => (
            <motion.button
              key={item.src}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              onClick={() => setLightbox(item)}
              aria-label={`Enlarge photo: ${item.alt}`}
              className={cn(
                'group relative overflow-hidden bg-card border border-border/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none aspect-[4/3] text-left',
                i === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : ''
              )}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fittingType="fill"
                sizes={i === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 50vw, 25vw'}
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-background/25 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
              
              {/* Photo Caption Badge */}
              <div className="absolute bottom-2 left-2 right-2 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-[0.62rem] text-foreground font-medium line-clamp-1">{item.alt}</p>
                {item.credit && (
                  <p className="text-[0.55rem] text-primary font-mono">{item.credit}</p>
                )}
              </div>
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
        </div>
      </section>

      {/* Lightbox with photographer credit */}
      <Lightbox
        src={lightbox?.src || null}
        alt={lightbox?.alt}
        credit={lightbox?.credit}
        onClose={() => setLightbox(null)}
      />
    </PageTransition>
  );
}