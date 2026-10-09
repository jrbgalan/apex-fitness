'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/Link';
import { MapPin, Clock, Phone, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import { api } from '@/api/client';
import { LocationItem } from '@/types';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';
import { motion } from 'framer-motion';

export default function LocationDetail({ id }: { id: string }) {
  const [location, setLocation] = useState<LocationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.entities.Locations.get(id)
      .then((data) => {
        setLocation(data);
        if (data?.gallery?.length) {
          setActivePhoto(data.gallery[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-36 pb-32 px-6 md:px-12 max-w-6xl mx-auto animate-pulse space-y-8">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-12 w-3/4 bg-muted rounded" />
        <div className="aspect-[16/9] w-full bg-muted/60 rounded" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="pt-40 pb-32 px-6 text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="font-heading text-2xl mb-2">Location Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">
          The requested club location does not exist or may have been relocated.
        </p>
        <Link
          to="/locations"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all locations</span>
        </Link>
      </div>
    );
  }

  const allPhotos = [
    location.photo,
    ...(location.gallery || []),
  ].filter((url, i, arr) => arr.indexOf(url) === i);

  return (
    <PageTransition>
      <div className="pt-32 md:pt-40 pb-28">
        {/* Breadcrumb & Navigation */}
        <div className="px-6 md:px-12 max-w-7xl mx-auto mb-8">
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Club Locations</span>
          </Link>
        </div>

        {/* Location Header Hero */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border/60">
            <div>
              <span className="text-[0.68rem] uppercase tracking-ultra text-primary font-mono font-medium">
                {location.city} District
              </span>
              <h1 className="mt-2 font-heading text-4xl sm:text-5xl md:text-6xl text-foreground">
                {location.name}
              </h1>
            </div>

            <Link
              to={`/book-tour?location=${encodeURIComponent(location.name)}`}
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-all self-start lg:self-auto gap-2 group"
            >
              <span>Book a Private Tour</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* Main Photo Gallery */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mt-10">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden bg-secondary/50 border border-border/70">
            <Image
              src={activePhoto || location.photo}
              alt={location.name}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-background/20 pointer-events-none" />
            {location.credit && (
              <span className="absolute bottom-3 right-3 text-[0.65rem] text-foreground/75 bg-background/80 px-2.5 py-1 backdrop-blur-sm border border-border/60">
                {location.credit}
              </span>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {allPhotos.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x-mandatory">
              {allPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(photo)}
                  className={`relative w-28 sm:w-36 aspect-[16/10] shrink-0 border overflow-hidden snap-center transition-all ${
                    (activePhoto || location.photo) === photo
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-border/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={photo} alt="" fill sizes="150px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Location Details Grid */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Description & Amenities */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h2 className="text-xs uppercase tracking-ultra text-primary font-semibold mb-4">
                The Architecture & Vision
              </h2>
              <p className="font-serif text-lg md:text-xl text-foreground/90 italic leading-relaxed">
                “{location.description}”
              </p>
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-ultra text-primary font-semibold mb-6">
                Club Amenities & Capabilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {location.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-4 bg-card border border-border/60"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Hours, Address, Contact Card */}
          <div className="lg:col-span-5">
            <div className="bg-card border border-border/80 p-8 space-y-6 sticky top-28">
              <h3 className="font-heading text-2xl text-foreground border-b border-border/60 pb-4">
                Club Access
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      Location
                    </p>
                    <p className="text-foreground leading-relaxed">{location.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      Operating Hours
                    </p>
                    <p className="text-foreground leading-relaxed">{location.hours}</p>
                  </div>
                </div>

                {location.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Direct Desk
                      </p>
                      <p className="text-foreground font-mono">{location.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-border/60 space-y-3">
                <Link
                  to={`/book-tour?location=${encodeURIComponent(location.name)}`}
                  className="w-full min-h-[46px] bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  Book a Tour Here
                </Link>
                <Link
                  to="/membership"
                  className="w-full min-h-[46px] border border-border text-foreground text-xs uppercase tracking-wider hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                >
                  View Membership Tiers
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

