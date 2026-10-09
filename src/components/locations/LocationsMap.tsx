'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from '@/components/Link';
import { LocationItem } from '@/types';
import {
  MapPin,
  Clock,
  ExternalLink,
  Navigation,
  Layers,
  Sparkles,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { getLocationHoursStatus } from '@/lib/locationUtils';
import { cn } from '@/lib/utils';

interface LocationsMapProps {
  locations: LocationItem[];
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  className?: string;
  isCompact?: boolean;
}

export default function LocationsMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  userCoords,
  className = '',
  isCompact = false,
}: LocationsMapProps) {
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = Roadmap, 'k' = Satellite
  const [zoom, setZoom] = useState<number>(15);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Active selected location or first in the directory
  const activeLocation = useMemo(() => {
    if (locations.length === 0) return null;
    return (
      locations.find((l) => l.id === selectedLocationId || l.slug === selectedLocationId) ||
      locations[0]
    );
  }, [locations, selectedLocationId]);

  // Construct Google Maps embed URL (Official no-API-key embed)
  const embedUrl = useMemo(() => {
    if (!activeLocation) {
      return `https://maps.google.com/maps?q=Metro+Manila+Philippines&t=${mapType}&z=12&ie=UTF8&iwloc=&output=embed`;
    }

    // Use full address & sanctuary name for precise pin placement
    const query = `${activeLocation.name}, ${activeLocation.address}`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  }, [activeLocation, mapType, zoom]);

  // Direct Google Maps navigation URL
  const directionsUrl = useMemo(() => {
    if (!activeLocation) return 'https://www.google.com/maps';
    const destination = `${activeLocation.name}, ${activeLocation.address}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  }, [activeLocation]);

  const hoursStatus = activeLocation ? getLocationHoursStatus(activeLocation) : null;

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden border border-border/80 bg-[#0c0c0c] flex flex-col select-none group',
        className
      )}
    >
      {/* Map Control Toolbar (Satellite toggle & External Google Maps link) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMapType((prev) => (prev === 'm' ? 'k' : 'm'))}
          className="px-2.5 py-1.5 rounded-lg bg-[#0e0e0e]/90 hover:bg-[#161616] text-[0.68rem] uppercase font-mono tracking-wider border border-border/70 text-foreground/90 backdrop-blur-md flex items-center gap-1.5 shadow-xl transition-all cursor-pointer min-h-[36px]"
          title="Toggle Satellite / Map"
        >
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>{mapType === 'm' ? 'Satellite' : 'Roadmap'}</span>
        </button>

        {activeLocation && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-[0.68rem] uppercase font-mono tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-xl transition-all min-h-[36px]"
            title="Open in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Directions</span>
          </a>
        )}
      </div>

      {/* Google Maps Embed Iframe (Zero API key required) */}
      <div className="relative w-full flex-1 min-h-[280px] overflow-hidden bg-[#111111]">
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d0d0d] gap-2.5">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[0.65rem] uppercase tracking-ultra text-muted-foreground font-mono">
              Loading Google Maps...
            </span>
          </div>
        )}

        <iframe
          key={`${activeLocation?.id || 'default'}-${mapType}`}
          title={activeLocation ? `${activeLocation.name} Google Map` : 'Apex Fitness Google Map'}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{
            border: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            minHeight: isCompact ? '280px' : '400px',
            filter: mapType === 'm' ? 'contrast(1.05) brightness(0.96)' : 'none',
          }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIframeLoaded(true)}
          className="w-full h-full"
        />
      </div>

      {/* Bottom Floating Club Preview Card (Only on non-compact view) */}
      {!isCompact && activeLocation && (
        <div className="p-3 sm:p-4 bg-[#0e0e0e]/95 border-t border-border/80 backdrop-blur-md">
          {/* Multi-location selector pills */}
          {locations.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 scrollbar-none text-[0.68rem]">
              <span className="text-[0.62rem] uppercase tracking-ultra font-mono text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
                <Compass className="w-3 h-3 text-primary" /> Clubs:
              </span>
              {locations.map((loc) => {
                const isSelected = loc.id === activeLocation.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => onSelectLocation(loc.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-md shrink-0 transition-all font-mono',
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'bg-card/70 hover:bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {loc.neighborhood || loc.city}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Club Details and Navigation Links */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-heading text-base font-semibold text-foreground truncate">
                  {activeLocation.name}
                </h4>
                <span className="text-[0.62rem] uppercase tracking-ultra px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono shrink-0">
                  {activeLocation.neighborhood || activeLocation.city}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <span>{activeLocation.address}</span>
              </p>
              {hoursStatus && (
                <p className="text-[0.68rem] text-primary/90 font-mono flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{hoursStatus.statusText}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/80 text-[0.68rem] uppercase font-mono tracking-wider text-foreground flex items-center gap-1.5 transition-colors min-h-[38px]"
              >
                <Navigation className="w-3.5 h-3.5 text-primary" />
                <span>Get Directions</span>
              </a>

              <Link
                to={`/locations/${activeLocation.slug}`}
                className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[0.68rem] uppercase font-mono tracking-wider font-semibold flex items-center gap-1.5 transition-colors min-h-[38px]"
              >
                <span>View Club</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
