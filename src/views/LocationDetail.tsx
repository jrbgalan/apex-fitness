'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from '@/components/Link';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Sparkles,
  Waves,
  Flame,
  Bike,
  Shield,
  Smile,
  CheckCircle2,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import { api } from '@/api/client';
import { LocationItem, ScheduleSlotItem, GalleryPhoto } from '@/types';
import { fadeUp, stagger, viewportOnce, EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { getLocationHoursStatus, formatTimeString } from '@/lib/locationUtils';

// Dynamic import for mini map in Contact section
const LocationsMap = dynamic(() => import('@/components/locations/LocationsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-[#0e0e0e] border border-border/60 flex items-center justify-center">
      <div className="text-[0.7rem] uppercase tracking-ultra font-mono text-muted-foreground animate-pulse">
        Loading Map...
      </div>
    </div>
  ),
});

const SUB_NAV_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'classes', label: 'Classes' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'hours', label: 'Hours' },
  { id: 'contact', label: 'Contact' },
] as const;

const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'Monday' },
  { key: 'Tue', label: 'Tuesday' },
  { key: 'Wed', label: 'Wednesday' },
  { key: 'Thu', label: 'Thursday' },
  { key: 'Fri', label: 'Friday' },
  { key: 'Sat', label: 'Saturday' },
  { key: 'Sun', label: 'Sunday' },
] as const;

function getAmenityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('pool') || lower.includes('aqua') || lower.includes('plunge')) return Waves;
  if (lower.includes('sauna') || lower.includes('steam') || lower.includes('thermal')) return Flame;
  if (lower.includes('box') || lower.includes('ring') || lower.includes('combat')) return Shield;
  if (lower.includes('cycle') || lower.includes('spin')) return Bike;
  if (lower.includes('kid') || lower.includes('child')) return Smile;
  if (lower.includes('24/7') || lower.includes('hour')) return Clock;
  return Sparkles;
}

// Animated Count-Up component
function AnimatedCounter({
  end,
  duration = 1.4,
  suffix = '',
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LocationDetail({
  slug,
  id,
}: {
  slug?: string;
  id?: string;
}) {
  const locationKey = slug || id || '';
  const [location, setLocation] = useState<LocationItem | null>(null);
  const [otherLocations, setOtherLocations] = useState<LocationItem[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlotItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Navigation & Day State
  const [activeSection, setActiveSection] = useState('overview');
  const [activeDay, setActiveDay] = useState<string>('Mon');

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartXRef = useRef<number>(0);

  // Set default active day based on current weekday
  useEffect(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const current = days[new Date().getDay()];
    setActiveDay(current);
  }, []);

  // Fetch Location, Other Clubs, and Classes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.entities.Locations.get(locationKey),
      api.entities.Locations.list(),
      api.entities.ScheduleSlots.list(),
    ])
      .then(([locData, allLocs, slots]) => {
        setLocation(locData);
        if (allLocs && locData) {
          setOtherLocations(allLocs.filter((l) => l.id !== locData.id && l.slug !== locData.slug));
        }
        if (slots && locData) {
          const clubSlots = slots.filter(
            (s) => !s.location || s.location === locData.slug || s.location === locData.id
          );
          setScheduleSlots(clubSlots);
        }
      })
      .finally(() => setLoading(false));
  }, [locationKey]);

  // Scroll-Spy Observer
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of SUB_NAV_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  };

  // Lightbox Keyboard Listeners
  const allPhotos: GalleryPhoto[] = useMemo(() => {
    if (!location) return [];
    if (location.gallery_photos && location.gallery_photos.length > 0) {
      return location.gallery_photos;
    }
    return (location.gallery || []).map((url) => ({
      url,
      photographer: location.photographer || 'Apex Archival',
      caption: location.name,
    }));
  }, [location]);

  const handlePrevPhoto = useCallback(() => {
    if (lightboxIndex === null || allPhotos.length === 0) return;
    setLightboxIndex((prev) => (prev! === 0 ? allPhotos.length - 1 : prev! - 1));
  }, [lightboxIndex, allPhotos.length]);

  const handleNextPhoto = useCallback(() => {
    if (lightboxIndex === null || allPhotos.length === 0) return;
    setLightboxIndex((prev) => (prev! === allPhotos.length - 1 ? 0 : prev! + 1));
  }, [lightboxIndex, allPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'ArrowRight') handleNextPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handlePrevPhoto, handleNextPhoto]);

  // Touch Swipe for Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    if (diff > 50) handlePrevPhoto();
    if (diff < -50) handleNextPhoto();
  };

  if (loading) {
    return (
      <div className="pt-36 pb-32 px-6 md:px-12 max-w-7xl mx-auto space-y-10 animate-pulse">
        <div className="h-6 w-32 bg-muted/60" />
        <div className="h-14 w-3/4 bg-muted/60" />
        <div className="aspect-[21/9] w-full bg-muted/40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-muted/40" />
          <div className="h-28 bg-muted/40" />
          <div className="h-28 bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="pt-44 pb-36 px-6 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="font-heading text-3xl mb-3 text-foreground">Sanctuary Not Found</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          The requested club sanctuary does not exist in our metropolitan directory.
        </p>
        <Link
          to="/locations"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to all locations</span>
        </Link>
      </div>
    );
  }

  const hoursStatus = getLocationHoursStatus(location);
  const currentDayName = DAYS_OF_WEEK.find((d) => d.key === activeDay)?.label || 'Monday';
  const filteredDaySlots = scheduleSlots.filter((slot) => slot.day === activeDay);

  // Google Maps Directions Link
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;

  return (
    <PageTransition>
      {/* 1. FULL-BLEED HERO */}
      <section className="relative min-h-[75vh] md:min-h-[82vh] flex items-end pb-16 md:pb-24 px-6 md:px-12 overflow-hidden bg-background">
        {/* Hero Background Image with Ken Burns */}
        <div className="absolute inset-0 z-0">
          <Image
            src={location.hero_image || location.photo}
            alt={location.name}
            fill
            priority
            sizes="100vw"
            className="object-cover animate-kenburns scale-105"
          />
          {/* Multi-layered dark architectural gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {/* Back link */}
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-6 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Club Directory</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[0.68rem] uppercase tracking-ultra px-3 py-1 bg-black/80 backdrop-blur-md border border-primary/40 text-primary font-mono font-medium">
                  {location.neighborhood} · {location.city}
                </span>

                {/* Hours status badge */}
                <span className="inline-flex items-center gap-2 text-[0.7rem] font-mono px-3 py-1 bg-black/80 backdrop-blur-md border border-border/80 text-foreground">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      hoursStatus.is24Hours
                        ? 'bg-primary animate-pulse'
                        : hoursStatus.isOpen
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-muted-foreground'
                    )}
                  />
                  <span>{hoursStatus.statusText}</span>
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-normal text-foreground tracking-tight leading-[1.05]">
                {location.name}
              </h1>

              <p className="text-muted-foreground text-sm sm:text-base flex items-start gap-2 max-w-xl">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>{location.address}</span>
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
              <Link
                to={`/book-tour?location=${encodeURIComponent(location.name)}`}
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 bg-primary text-primary-foreground text-xs uppercase tracking-ultra font-semibold hover:bg-primary/90 transition-all shadow-xl gap-2 group"
              >
                <span>Book a Tour</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[48px] px-6 py-3.5 border border-border/80 bg-card/80 backdrop-blur-md text-foreground text-xs uppercase tracking-ultra hover:border-primary hover:text-primary transition-all gap-2"
              >
                <Navigation className="w-3.5 h-3.5 text-primary" />
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STICKY SUB-NAV WITH SCROLL-SPY */}
      <nav className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-md border-y border-border/60 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1 sm:gap-2">
            {SUB_NAV_SECTIONS.map(({ id: sectionId, label }) => {
              const isActive = activeSection === sectionId;
              return (
                <button
                  key={sectionId}
                  onClick={() => scrollToSection(sectionId)}
                  className={cn(
                    'relative min-h-[44px] px-3.5 sm:px-5 text-[0.7rem] sm:text-xs uppercase tracking-wider font-mono transition-colors whitespace-nowrap select-none',
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="subnavActiveIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                      transition={{ duration: 0.25, ease: EASE }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <Link
            to={`/book-tour?location=${encodeURIComponent(location.name)}`}
            className="hidden md:inline-flex items-center gap-1.5 text-[0.68rem] uppercase tracking-wider text-primary font-mono hover:underline shrink-0"
          >
            <span>Reserve Club Tour</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* 3. OVERVIEW SECTION */}
      <section id="overview" className="px-6 md:px-12 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[0.68rem] uppercase tracking-ultra text-primary font-mono font-medium">
              Architectural Sanctuaries
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-foreground font-normal tracking-tight">
              A bespoke environment for elite physical progression.
            </h2>
            <p className="text-foreground/80 text-sm sm:text-base leading-relaxed">
              {location.description}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Each square foot is custom-engineered to optimize neurological recruitment, acoustic focus,
              and post-exertion recovery. Our bespoke platforms are outfitted with Olympic barbells,
              calibrated competition plates, and dedicated thermal recovery corridors.
            </p>
          </div>

          {/* Key Stats with Count-Up Animation */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <div className="p-6 border border-border/70 bg-card/50 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <span className="text-[0.65rem] uppercase tracking-ultra text-muted-foreground font-mono">
                Training Footprint
              </span>
              <div className="mt-2 font-heading text-3xl sm:text-4xl text-primary font-semibold">
                <AnimatedCounter end={location.stats.sqft} suffix=" SQFT" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Custom acoustic floor damping</p>
            </div>

            <div className="p-6 border border-border/70 bg-card/50 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <span className="text-[0.65rem] uppercase tracking-ultra text-muted-foreground font-mono">
                Specialized Studios
              </span>
              <div className="mt-2 font-heading text-3xl sm:text-4xl text-foreground font-semibold">
                <AnimatedCounter end={location.stats.studios} suffix=" Studios" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Pilates, cycling & combat spaces</p>
            </div>

            <div className="p-6 border border-border/70 bg-card/50 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <span className="text-[0.65rem] uppercase tracking-ultra text-muted-foreground font-mono">
                Tier-1 Master Trainers
              </span>
              <div className="mt-2 font-heading text-3xl sm:text-4xl text-foreground font-semibold">
                <AnimatedCounter end={location.stats.trainers} suffix=" Coaches" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Biomechanic & Olympic certified</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AMENITIES SECTION */}
      <section id="amenities" className="px-6 md:px-12 py-20 md:py-28 bg-card/30 border-y border-border/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            label="Club Features"
            title="Engineered for total human output."
            intro="Experience our curated roster of performance, thermal, and athletic amenities available exclusively at this club."
            align="left"
          />

          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {location.amenities.map((amenity) => {
              const Icon = getAmenityIcon(amenity);
              return (
                <motion.div
                  key={amenity}
                  variants={fadeUp}
                  className="p-5 border border-border/60 bg-card/60 hover:border-primary/50 transition-all flex items-start gap-4 group"
                >
                  <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground font-heading">
                      {amenity}
                    </h4>
                    <p className="mt-1 text-[0.72rem] text-muted-foreground line-clamp-2">
                      Complimentary access included with Plus, Elite & Black Card memberships.
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 5. CLASSES & SCHEDULE SECTION */}
      <section id="classes" className="px-6 md:px-12 py-20 md:py-28 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            label="Club Schedule"
            title="Weekly Masterclasses."
            intro={`Live class timetable tailored to ${location.name}. Reserve your training spot in advance.`}
            align="left"
          />

          <Link
            to="/classes"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-mono hover:underline min-h-[44px]"
          >
            <span>Explore All 16+ Masterclasses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Day Tabs (Scrollable on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-border/60 pb-2">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const isDayActive = activeDay === key;
            return (
              <button
                key={key}
                onClick={() => setActiveDay(key)}
                className={cn(
                  'min-h-[44px] px-5 py-2 text-xs uppercase tracking-wider font-mono transition-all shrink-0 border select-none',
                  isDayActive
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'border-border/60 bg-card/60 text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{key}</span>
                <span className="hidden sm:inline"> — {label}</span>
              </button>
            );
          })}
        </div>

        {/* Class Slots List */}
        <div className="space-y-3 min-h-[300px]">
          {filteredDaySlots.length === 0 ? (
            <div className="py-16 text-center border border-border/60 bg-card/40 p-8 space-y-3">
              <Calendar className="w-8 h-8 text-primary mx-auto" />
              <p className="font-heading text-lg text-foreground">
                No scheduled masterclasses on {currentDayName}
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                The open gym floor, Olympic platforms, and recovery suites remain fully operational according to club hours.
              </p>
            </div>
          ) : (
            filteredDaySlots.map((slot) => (
              <div
                key={slot.id}
                className="p-4 sm:p-5 border border-border/60 bg-card/40 hover:border-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="px-3 py-2 bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-semibold text-center shrink-0">
                    <div>{slot.start_time}</div>
                    <div className="text-[0.62rem] text-primary/70">{slot.end_time}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading text-lg text-foreground font-medium">
                        {slot.class_name}
                      </h4>
                      <span className="text-[0.65rem] uppercase tracking-wider px-2 py-0.5 bg-card border border-border/70 text-muted-foreground font-mono">
                        {slot.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Coached by <span className="text-foreground">{slot.trainer}</span>
                      {slot.spots_remaining !== undefined && (
                        <span className="ml-2 text-primary font-mono text-[0.7rem]">
                          ({slot.spots_remaining} spots left)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/book-tour?class=${encodeURIComponent(slot.class_name)}&location=${encodeURIComponent(location.name)}`}
                  className="inline-flex items-center justify-center min-h-[40px] px-5 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-colors self-end sm:self-auto shrink-0"
                >
                  <span>Book Spot</span>
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 6. PHOTO GALLERY WITH ASYMMETRIC MASONRY & LIGHTBOX */}
      <section id="gallery" className="px-6 md:px-12 py-20 md:py-28 bg-card/20 border-y border-border/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            label="Visual Archival"
            title="The Club Sanctuary Gallery."
            intro="Eight curated perspectives of our architectural interiors, Olympic lifting equipment, and restorative lounges."
            align="left"
          />

          {/* Asymmetric Masonry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[240px]">
            {allPhotos.map((photo, index) => {
              // Asymmetric spans: 1st is 2x2, 4th is 2x1, 7th is 2x1
              const isLarge = index === 0;
              const isWide = index === 3 || index === 6;

              return (
                <div
                  key={photo.url + index}
                  onClick={() => setLightboxIndex(index)}
                  className={cn(
                    'group relative overflow-hidden cursor-pointer border border-border/60 bg-neutral-900',
                    isLarge && 'sm:col-span-2 sm:row-span-2',
                    isWide && 'sm:col-span-2'
                  )}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || `${location.name} interior ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                  {/* Caption & Photographer overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <span className="text-xs font-heading text-white line-clamp-1">
                      {photo.caption || location.name}
                    </span>
                    <span className="text-[0.62rem] font-mono uppercase text-muted-foreground bg-black/75 px-2 py-0.5 border border-white/10 shrink-0">
                      Photo by {photo.photographer}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxIndex !== null && allPhotos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>
                {lightboxIndex + 1} / {allPhotos.length} · {location.name}
              </span>
              <button
                onClick={() => setLightboxIndex(null)}
                className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-white hover:text-primary transition-colors"
                aria-label="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Main Image */}
            <div className="relative flex-1 max-w-5xl mx-auto w-full my-4 flex items-center justify-center">
              <div className="relative w-full h-full max-h-[75vh]">
                <Image
                  src={allPhotos[lightboxIndex].url}
                  alt={allPhotos[lightboxIndex].caption || 'Club Photo'}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Prev / Next Arrows */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] p-3 rounded-full bg-black/60 border border-white/20 text-white hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] p-3 rounded-full bg-black/60 border border-white/20 text-white hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Footer Caption & Photographer Credit */}
            <div className="text-center text-xs space-y-1">
              <p className="text-white font-heading text-sm">
                {allPhotos[lightboxIndex].caption}
              </p>
              <p className="text-muted-foreground font-mono text-[0.7rem]">
                Photo by {allPhotos[lightboxIndex].photographer} on Unsplash · Press Esc or swipe to exit
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. HOURS SECTION */}
      <section id="hours" className="px-6 md:px-12 py-20 md:py-28 max-w-7xl mx-auto space-y-10">
        <SectionHeading
          label="Club Access"
          title="Daily Operating Hours."
          intro="Concierge desks, sauna heating cycles, and executive locker rooms adhere to the daily schedule below."
          align="left"
        />

        <div className="max-w-3xl border border-border/70 bg-card/40 overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border/70 bg-muted/30 text-muted-foreground font-mono uppercase text-[0.68rem] tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-medium">Day</th>
                <th className="py-3.5 px-6 font-medium">Operating Hours</th>
                <th className="py-3.5 px-6 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {location.daily_hours?.map((dh) => {
                const isToday =
                  dh.day.toLowerCase() ===
                  new Date()
                    .toLocaleDateString('en-US', { weekday: 'long' })
                    .toLowerCase();

                return (
                  <tr
                    key={dh.day}
                    className={cn(
                      'transition-colors',
                      isToday
                        ? 'bg-primary/10 font-medium text-foreground'
                        : 'hover:bg-card/80 text-foreground/80'
                    )}
                  >
                    <td className="py-4 px-6 flex items-center gap-2">
                      <span>{dh.day}</span>
                      {isToday && (
                        <span className="text-[0.62rem] uppercase tracking-wider px-1.5 py-0.5 bg-primary text-primary-foreground font-mono font-bold">
                          Today
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      {dh.is24Hours
                        ? 'Open 24 Hours'
                        : `${formatTimeString(dh.open)} — ${formatTimeString(dh.close)}`}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-[0.7rem]">
                      {isToday ? (
                        <span
                          className={cn(
                            hoursStatus.isOpen ? 'text-emerald-400' : 'text-muted-foreground'
                          )}
                        >
                          {hoursStatus.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. CONTACT SECTION WITH EMBEDDED MINI MAP */}
      <section id="contact" className="px-6 md:px-12 py-20 md:py-28 bg-card/30 border-t border-border/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            label="Direct Concierge"
            title="Connect with this clubhouse."
            intro="For private tour bookings, corporate wellness accounts, or personal trainer pairings."
            align="left"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 border border-border/70 bg-card/60 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                      Clubhouse Address
                    </h4>
                    <p className="mt-1 text-sm text-foreground">{location.address}</p>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary font-mono hover:underline"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                      Direct Concierge Line
                    </h4>
                    <a
                      href={`tel:${location.phone}`}
                      className="mt-1 block text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {location.phone}
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-start gap-3">
                  <Mail className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                      Club Inquiries & Memberships
                    </h4>
                    <a
                      href={`mailto:${location.email}`}
                      className="mt-1 block text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {location.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Mini Leaflet Map */}
            <div className="lg:col-span-7 h-72 sm:h-80 border border-border/70 overflow-hidden shadow-xl">
              <LocationsMap
                locations={[location]}
                selectedLocationId={location.id}
                onSelectLocation={() => {}}
                isCompact
              />
            </div>
          </div>
        </div>
      </section>

      {/* 9. OTHER CLUBS NEAR YOU CAROUSEL */}
      {otherLocations.length > 0 && (
        <section className="px-6 md:px-12 py-20 md:py-28 max-w-7xl mx-auto space-y-10 border-t border-border/60">
          <div className="flex items-end justify-between">
            <SectionHeading
              label="Network Exploration"
              title="Other clubs near you."
              intro="Explore companion facilities included with your multi-club membership tier."
              align="left"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherLocations.slice(0, 3).map((other) => (
              <Link
                key={other.id}
                to={`/locations/${other.slug}`}
                className="group border border-border/60 bg-card/40 hover:border-border transition-all block overflow-hidden"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={other.photo}
                    alt={other.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 text-[0.62rem] uppercase tracking-ultra px-2 py-0.5 bg-black/80 text-primary border border-primary/30 font-mono">
                    {other.neighborhood || other.city}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="font-heading text-xl text-foreground group-hover:text-primary transition-colors">
                    {other.name}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {other.address}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-primary font-semibold">
                    <span>View Club</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  );
}
