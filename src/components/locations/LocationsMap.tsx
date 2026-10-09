'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Image from 'next/image';
import Link from '@/components/Link';
import { LocationItem } from '@/types';
import { Clock, MapPin, ArrowRight, Compass, ShieldAlert } from 'lucide-react';

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

// Controller component to handle bounds fitting, fly-to animations, and mobile interaction lock
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
  const prevSelectedRef = useRef<string | null>(selectedLocationId);

  // Invalidate map size shortly after mount to ensure accurate container dimensions
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  // Handle fly-to on selection change
  useEffect(() => {
    if (!selectedLocationId) return;

    // Do not fly on initial load or if selection is unchanged
    if (prevSelectedRef.current === selectedLocationId) return;

    const target = locations.find((l) => l.id === selectedLocationId || l.slug === selectedLocationId);
    if (target && isValidCoordinate(target.latitude, target.longitude)) {
      prevSelectedRef.current = selectedLocationId;

      try {
        // Stop any currently running animation before starting a new flyTo
        map.stop();

        const size = map.getSize();
        if (size && size.x > 0 && size.y > 0) {
          map.flyTo([target.latitude, target.longitude], 14, {
            duration: 1.2,
            easeLinearity: 0.25,
          });
        } else {
          // If container has not yet computed layout dimensions, set view directly
          map.setView([target.latitude, target.longitude], 14);
        }
      } catch (err) {
        console.warn('Map flyTo navigation safely caught:', err);
      }
    }

    // Crucial: Cancel any running Leaflet animation when unmounting or changing target
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

export default function LocationsMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  userCoords,
  className = '',
  isCompact = false,
}: LocationsMapProps) {
  const [tileError, setTileError] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  // Metro Manila center default (strictly validated)
  const defaultCenter: [number, number] = useMemo(() => {
    if (locations.length > 0) {
      const target = selectedLocationId
        ? locations.find((l) => l.id === selectedLocationId || l.slug === selectedLocationId) || locations[0]
        : locations[0];
      if (target && isValidCoordinate(target.latitude, target.longitude)) {
        return [target.latitude, target.longitude];
      }
    }
    return [14.5507, 121.0504]; // BGC Flagship fallback
  }, [locations, selectedLocationId]);

  const tileLayerUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-none border border-border/70 bg-[#0d0d0d] select-none ${className}`}
      onClick={() => setIsInteractive(true)}
      onTouchStart={() => setIsInteractive(true)}
    >
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={isInteractive}
        dragging={true}
        touchZoom={isInteractive}
        style={{ width: '100%', height: '100%', background: '#0d0d0d' }}
        attributionControl={!isCompact}
      >
        <TileLayer
          url={tileLayerUrl}
          attribution={tileAttribution}
          subdomains={['a', 'b', 'c', 'd']}
          maxZoom={19}
          eventHandlers={{
            tileerror: () => setTileError(true),
          }}
        />

        <MapController
          locations={locations}
          selectedLocationId={selectedLocationId}
          userCoords={userCoords}
        />

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

        {/* Location Markers */}
        {locations
          .filter((loc) => isValidCoordinate(loc.latitude, loc.longitude))
          .map((loc) => {
            const isActive = loc.id === selectedLocationId || loc.slug === selectedLocationId;
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
                        <ArrowRight className="w-3 h-3" />
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

      {/* Tile loading fallback notice */}
      {tileError && (
        <div className="absolute top-3 left-3 z-[400] px-2.5 py-1.5 bg-card/90 border border-amber-500/40 text-amber-300 text-[0.68rem] flex items-center gap-1.5 rounded">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Vector markers active (Tile network degraded)</span>
        </div>
      )}
    </div>
  );
}

