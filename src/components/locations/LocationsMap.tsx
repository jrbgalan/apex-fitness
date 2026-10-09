'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from '@/components/Link';
import { LocationItem } from '@/types';
import {
  MapPin,
  Clock,
  Navigation,
  Layers,
  ArrowRight,
  Compass,
  Plus,
  Minus,
  Sparkles,
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
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Active selected location or first in the directory
  const activeLocation = useMemo(() => {
    if (locations.length === 0) return null;
    return (
      locations.find((l) => l.id === selectedLocationId || l.slug === selectedLocationId) ||
      locations[0]
    );
  }, [locations, selectedLocationId]);

  // Construct Google Maps embed URL (Official zero-API-key embed)
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
        'relative w-full h-full overflow-hidden border border-border/80 bg-[#0a0a0a] flex flex-col select-none shadow-2xl',
        className
      )}
    >
      {/* 1. TOP STATUS & CONTROLS BAR (Only in full mode) */}
      {!isCompact && activeLocation && (
        <div className="px-4 py-2.5 bg-[#0e0e0e]/95 border-b border-border/70 backdrop-blur-md flex items-center justify-between gap-3 z-20">
          {/* Active Club Indicator */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="font-heading text-sm text-foreground font-medium truncate">
              {activeLocation.name}
            </span>
            <span className="hidden sm:inline-block text-[0.62rem] uppercase font-mono tracking-ultra px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary shrink-0">
              {activeLocation.neighborhood || activeLocation.city}
            </span>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center border border-border/70 rounded-md bg-card/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 1, 19))}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-border/70" />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 1, 10))}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Satellite / Map Toggle */}
            <button
              type="button"
              onClick={() => setMapType((prev) => (prev === 'm' ? 'k' : 'm'))}
              className="px-2.5 py-1.5 rounded-md bg-card/70 hover:bg-card text-[0.65rem] uppercase font-mono tracking-wider border border-border/70 text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
              title="Toggle Satellite / Roadmap"
            >
              <Layers className="w-3 h-3 text-primary" />
              <span className="hidden md:inline">{mapType === 'm' ? 'Satellite' : 'Roadmap'}</span>
            </button>

            {/* Directions Link */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-[0.65rem] uppercase font-mono tracking-wider font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Navigate with Google Maps"
            >
              <Navigation className="w-3 h-3" />
              <span>Directions</span>
            </a>
          </div>
        </div>
      )}

      {/* 2. GOOGLE MAPS EMBED IFRAME (Smooth, no remount on hover) */}
      <div className="relative w-full flex-1 min-h-[300px] overflow-hidden bg-[#111111]">
        {!isIframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d0d0d] gap-2.5">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[0.65rem] uppercase tracking-ultra text-muted-foreground font-mono">
              Loading Google Maps...
            </span>
          </div>
        )}

        <iframe
          ref={iframeRef}
          key={mapType} // Only remount if switching between Satellite and Roadmap
          title={activeLocation ? `${activeLocation.name} Google Map` : 'Apex Fitness Google Map'}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{
            border: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            minHeight: isCompact ? '280px' : '420px',
            filter: mapType === 'm' ? 'contrast(1.04) brightness(0.97)' : 'none',
          }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsIframeLoaded(true)}
          className="w-full h-full"
        />
      </div>

      {/* 3. BOTTOM PREVIEW FOOTER & CLUB PILLS (Only in full mode) */}
      {!isCompact && activeLocation && (
        <div className="p-3 sm:p-4 bg-[#0e0e0e]/95 border-t border-border/80 backdrop-blur-md space-y-3 z-20">
          {/* Quick Sanctuary Pills */}
          {locations.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[0.68rem]">
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

          {/* Active Club Card Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/50">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-heading text-base font-semibold text-foreground truncate">
                  {activeLocation.name}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{activeLocation.address}</span>
              </p>
              {hoursStatus && (
                <p className="text-[0.68rem] text-primary font-mono flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{hoursStatus.statusText}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/locations/${activeLocation.slug}`}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[0.7rem] uppercase font-mono tracking-wider font-semibold flex items-center gap-1.5 transition-all shadow-md min-h-[38px]"
              >
                <span>View Sanctuary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
