'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Image from 'next/image';
import Link from '@/components/Link';
import { LocationItem } from '@/types';
import {
  Clock,
  MapPin,
  ArrowRight,
  Compass,
  Navigation,
  Layers,
  Plus,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLocationHoursStatus } from '@/lib/locationUtils';

interface LocationsMapProps {
  locations: LocationItem[];
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  className?: string;
  isCompact?: boolean;
}

// Custom Leaflet DivIcon with pulsing champagne styling
function getChampagneIcon(isActive: boolean) {
  return L.divIcon({
    className: `custom-champagne-marker ${isActive ? 'is-active' : ''}`,
    html: `
      <div class="champagne-marker-pulse"></div>
      <div class="champagne-marker-dot"></div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function getUserLocationIcon() {
  return L.divIcon({
    className: 'custom-champagne-marker',
    html: `
      <div style="width: 24px; height: 24px; border-radius: 9999px; background: rgba(59, 130, 246, 0.25); display: flex; align-items: center; justify-content: center;">
        <div style="width: 10px; height: 10px; border-radius: 9999px; background: #60a5fa; border: 2px solid #fff; box-shadow: 0 0 8px rgba(96, 165, 250, 0.8);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function isValidCoordinate(lat?: unknown, lng?: unknown): lat is number {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

type MapLayerType = 'dark' | 'google' | 'satellite';

const MAP_LAYERS: Record<
  MapLayerType,
  { label: string; url: string; subdomains?: string[]; attribution: string; maxZoom: number; className?: string }
> = {
  dark: {
    label: 'Dark Mode',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    className: 'leaflet-tile-dark',
  },
  google: {
    label: 'Roadmap',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  satellite: {
    label: 'Satellite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
};

// Map Controller for smooth flyTo on hover and bounds fitting
function MapController({
  locations,
  selectedLocationId,
  userCoords,
}: {
  locations: LocationItem[];
  selectedLocationId: string | null;
  userCoords?: { latitude: number; longitude: number } | null;
}) {
  const map = useMap();
  const prevSelectedRef = useRef<string | null>(null);

  // Invalidate map size on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  // Smooth, seamless flyTo camera glide when selected location changes
  useEffect(() => {
    if (!selectedLocationId || locations.length === 0) return;

    if (prevSelectedRef.current === selectedLocationId) return;

    const target = locations.find(
      (l) => l.id === selectedLocationId || l.slug === selectedLocationId
    );

    if (target && isValidCoordinate(target.latitude, target.longitude)) {
      prevSelectedRef.current = selectedLocationId;

      try {
        // Stop any running animation before gliding to the new target
        map.stop();

        const size = map.getSize();
        if (size && size.x > 0 && size.y > 0) {
          map.flyTo([target.latitude, target.longitude], 15, {
            duration: 0.9,
            easeLinearity: 0.25,
          });
        } else {
          map.setView([target.latitude, target.longitude], 15);
        }
      } catch (err) {
        console.warn('Map flyTo navigation safely caught:', err);
      }
    }

    return () => {
      try {
        map.stop();
      } catch {}
    };
  }, [selectedLocationId, locations, map]);

  // Fit bounds when locations list changes and no specific location is selected
  useEffect(() => {
    if (locations.length === 0) return;

    if (!selectedLocationId) {
      const validLocs = locations.filter((loc) => isValidCoordinate(loc.latitude, loc.longitude));
      const latLngs: [number, number][] = validLocs.map((loc) => [loc.latitude, loc.longitude]);

      if (userCoords && isValidCoordinate(userCoords.latitude, userCoords.longitude)) {
        latLngs.push([userCoords.latitude, userCoords.longitude]);
      }

      if (latLngs.length === 1) {
        try {
          map.stop();
          map.setView(latLngs[0], 14);
        } catch {}
      } else if (latLngs.length > 1) {
        try {
          map.stop();
          const bounds = L.latLngBounds(latLngs);
          if (bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [48, 48],
              maxZoom: 13,
              animate: false,
            });
          }
        } catch {}
      }
    }

    return () => {
      try {
        map.stop();
      } catch {}
    };
  }, [locations, userCoords, map, selectedLocationId]);

  return null;
}

// In-map custom Zoom Controls
function MapZoomButtons() {
  const map = useMap();

  return (
    <div className="absolute bottom-6 right-4 z-[400] flex flex-col items-center bg-[#141414]/90 border border-border/80 shadow-xl overflow-hidden backdrop-blur-md">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomIn();
        }}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>
      <div className="w-full h-px bg-border/60" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomOut();
        }}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function LocationsMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  userCoords,
  className = '',
  isCompact = false,
}: LocationsMapProps) {
  const [layerType, setLayerType] = useState<MapLayerType>('dark');
  const [isInteractive, setIsInteractive] = useState(false);

  // Active selected location or first in the directory
  const activeLocation = useMemo(() => {
    if (locations.length === 0) return null;
    return (
      locations.find((l) => l.id === selectedLocationId || l.slug === selectedLocationId) ||
      locations[0]
    );
  }, [locations, selectedLocationId]);

  // Center default coordinates
  const defaultCenter: [number, number] = useMemo(() => {
    if (locations.length > 0) {
      const target = selectedLocationId
        ? locations.find((l) => l.id === selectedLocationId || l.slug === selectedLocationId) ||
          locations[0]
        : locations[0];
      if (target && isValidCoordinate(target.latitude, target.longitude)) {
        return [target.latitude, target.longitude];
      }
    }
    return [14.5507, 121.0504]; // BGC Flagship fallback
  }, [locations, selectedLocationId]);

  // Direct Google Maps navigation URL
  const directionsUrl = useMemo(() => {
    if (!activeLocation) return 'https://www.google.com/maps';
    const destination = `${activeLocation.name}, ${activeLocation.address}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  }, [activeLocation]);

  const activeLayer = MAP_LAYERS[layerType];

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden border border-border/80 bg-[#0a0a0a] flex flex-col select-none shadow-2xl',
        className
      )}
      onClick={() => setIsInteractive(true)}
      onTouchStart={() => setIsInteractive(true)}
    >
      {/* 1. TOP STATUS & CONTROLS BAR (Full mode) */}
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
            {/* Map Style Selector */}
            <div className="flex items-center border border-border/70 rounded-md bg-card/60 overflow-hidden text-[0.65rem] font-mono">
              <button
                type="button"
                onClick={() => setLayerType('dark')}
                className={cn(
                  'px-2.5 py-1.5 uppercase transition-colors',
                  layerType === 'dark'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Dark Luxury Map"
              >
                Dark
              </button>
              <div className="w-px h-3.5 bg-border/70" />
              <button
                type="button"
                onClick={() => setLayerType('google')}
                className={cn(
                  'px-2.5 py-1.5 uppercase transition-colors',
                  layerType === 'google'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Google Maps"
              >
                Google
              </button>
              <div className="w-px h-3.5 bg-border/70" />
              <button
                type="button"
                onClick={() => setLayerType('satellite')}
                className={cn(
                  'px-2.5 py-1.5 uppercase transition-colors',
                  layerType === 'satellite'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Satellite View"
              >
                Satellite
              </button>
            </div>

            {/* Directions Link */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-md bg-card/80 hover:bg-card text-[0.65rem] uppercase font-mono tracking-wider border border-border/70 text-primary flex items-center gap-1.5 transition-all shadow-sm"
              title="Navigate with Google Maps"
            >
              <Navigation className="w-3 h-3" />
              <span className="hidden md:inline">Directions</span>
            </a>
          </div>
        </div>
      )}

      {/* 2. LEAFLET INTERACTIVE MAP */}
      <div className="relative w-full flex-1 min-h-[300px] overflow-hidden bg-[#0d0d0d]">
        <MapContainer
          center={defaultCenter}
          zoom={14}
          scrollWheelZoom={isInteractive}
          dragging={true}
          touchZoom={isInteractive}
          zoomControl={false}
          style={{ width: '100%', height: '100%', background: '#0d0d0d' }}
          attributionControl={!isCompact}
        >
          <TileLayer
            key={layerType}
            url={activeLayer.url}
            attribution={activeLayer.attribution}
            subdomains={activeLayer.subdomains || []}
            maxZoom={activeLayer.maxZoom}
            className={activeLayer.className}
          />

          <MapController
            locations={locations}
            selectedLocationId={selectedLocationId}
            userCoords={userCoords}
          />

          <MapZoomButtons />

          {/* User Location Marker if available */}
          {userCoords && isValidCoordinate(userCoords.latitude, userCoords.longitude) && (
            <Marker
              position={[userCoords.latitude, userCoords.longitude]}
              icon={getUserLocationIcon()}
            >
              <Popup>
                <div className="p-3 text-center text-xs">
                  <span className="font-semibold text-sky-400">Your Current Location</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Gym Location Markers */}
          {locations
            .filter((loc) => isValidCoordinate(loc.latitude, loc.longitude))
            .map((loc) => {
              const isActive =
                loc.id === selectedLocationId || loc.slug === selectedLocationId;

              return (
                <Marker
                  key={loc.id}
                  position={[loc.latitude, loc.longitude]}
                  icon={getChampagneIcon(isActive)}
                  eventHandlers={{
                    click: () => {
                      onSelectLocation(loc.id);
                    },
                  }}
                >
                  <Popup className="apex-dark-popup">
                    <div className="w-64 max-w-[85vw] bg-[#141414] overflow-hidden text-neutral-200">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                        <Image
                          src={loc.photo}
                          alt={loc.name}
                          fill
                          sizes="256px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <span className="absolute top-2 left-2 text-[0.62rem] uppercase tracking-ultra px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-primary/40 text-primary font-mono">
                          {loc.neighborhood || loc.city}
                        </span>
                      </div>

                      <div className="p-3 space-y-2">
                        <h4 className="font-heading text-base font-semibold text-foreground leading-tight">
                          {loc.name}
                        </h4>

                        <div className="flex items-start gap-1.5 text-[0.72rem] text-muted-foreground line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{loc.address}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[0.7rem] text-primary/90 font-mono">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{loc.hours}</span>
                        </div>

                        <div className="pt-2 border-t border-border/50">
                          <Link
                            to={`/locations/${loc.slug}`}
                            className="flex items-center justify-between w-full px-3 py-2 bg-primary text-primary-foreground text-[0.68rem] uppercase tracking-wider font-semibold hover:bg-primary/90 transition-colors"
                          >
                            <span>View Club</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {/* Mobile tap overlay indicator */}
        {!isInteractive && (
          <div className="md:hidden absolute inset-0 z-[400] bg-black/25 flex items-end justify-center pb-4 pointer-events-none transition-opacity">
            <div className="px-3 py-1.5 rounded-full bg-card/90 border border-border/80 text-[0.7rem] text-foreground tracking-wider uppercase backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span>Tap to interact with map</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
