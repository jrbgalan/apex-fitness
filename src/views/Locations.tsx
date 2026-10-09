'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from '@/components/Link';
import { MapPin, Clock, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import { api } from '@/api/client';
import { LocationItem } from '@/types';
import { fadeUp, stagger, viewportOnce, EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

const CITIES = ['All', 'Taguig', 'Makati', 'Pasig', 'Alabang', 'Quezon City'] as const;

export default function Locations() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [activeCity, setActiveCity] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.entities.Locations.list();
      setLocations(data || []);
    } catch {
      setError('Unable to load our club locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    if (activeCity === 'All') return locations;
    return locations.filter((loc) => loc.city.toLowerCase() === activeCity.toLowerCase());
  }, [locations, activeCity]);

  return (
    <PageTransition>
      {/* Header section */}
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12 text-center max-w-5xl mx-auto">
        <SectionHeading
          label="The Network"
          title="Sanctuaries of discipline."
          intro="Five architectural clubhouses positioned across Metro Manila's premier enclaves. Built with commercial-grade Olympic platforms, bespoke recovery suites, and private member lounges."
          align="center"
          className="mx-auto"
        />

        {/* City Filter Tabs */}
        <div className="mt-10 flex items-center justify-center">
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full pb-2 px-2 snap-x-mandatory">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={cn(
                  'min-h-[44px] px-5 py-2 text-xs uppercase tracking-ultra transition-all select-none whitespace-nowrap shrink-0 snap-center border',
                  activeCity === city
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'border-border/60 bg-card/60 text-foreground/70 hover:text-foreground hover:border-border'
                )}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Card Grid */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto min-h-[500px]">
        {error ? (
          <div className="p-8 border border-border/60 text-center max-w-lg mx-auto my-12 bg-card">
            <AlertCircle className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="text-foreground font-heading text-xl">Directory Notice</p>
            <p className="mt-2 text-foreground/60 text-sm">{error}</p>
            <button
              onClick={fetchLocations}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 border border-border text-[0.7rem] uppercase tracking-label text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border/60 bg-card/40 space-y-4 animate-pulse p-4">
                <div className="aspect-[16/10] w-full bg-muted/60" />
                <div className="h-4 w-24 bg-muted" />
                <div className="h-6 w-3/4 bg-muted" />
                <div className="h-10 w-full bg-muted/40" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            key={activeCity}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="group flex flex-col bg-card border border-border/70 hover:border-border transition-all duration-300"
              >
                {/* Photo with hover zoom */}
                <Link
                  to={`/locations/${loc.id}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-secondary/40 block"
                >
                  <Image
                    src={loc.photo}
                    alt={loc.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[0.62rem] uppercase tracking-wider font-mono font-semibold px-2.5 py-1 bg-background/90 border border-border/80 text-primary">
                      {loc.city}
                    </span>
                  </div>
                </Link>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    <Link to={`/locations/${loc.id}`}>
                      <h3 className="font-heading text-xl text-foreground group-hover:text-primary transition-colors">
                        {loc.name}
                      </h3>
                    </Link>

                    <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{loc.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        <span>{loc.hours}</span>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-foreground/70 leading-relaxed line-clamp-2">
                      {loc.description}
                    </p>

                    {/* Amenities Badges */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {loc.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="text-[0.65rem] px-2 py-0.5 bg-secondary/50 border border-border/60 text-foreground/80 font-mono"
                        >
                          {amenity}
                        </span>
                      ))}
                      {loc.amenities.length > 3 && (
                        <span className="text-[0.65rem] px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary font-mono">
                          +{loc.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                    <Link
                      to={`/locations/${loc.id}`}
                      className="min-h-[44px] inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary hover:text-foreground transition-colors group/link font-medium"
                    >
                      <span>Explore Club</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                    </Link>

                    <Link
                      to={`/book-tour?location=${encodeURIComponent(loc.name)}`}
                      className="min-h-[44px] px-3.5 py-2 border border-border/80 text-[0.68rem] uppercase tracking-wider text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center font-medium"
                    >
                      Book a Tour
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </section>
    </PageTransition>
  );
}

