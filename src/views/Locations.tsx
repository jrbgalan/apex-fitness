'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from '@/components/Link';
import {
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  Compass,
  Map as MapIcon,
  List as ListIcon,
  Waves,
  Flame,
  Bike,
  Shield,
  Smile,
  Check,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import { api } from '@/api/client';
import { LocationItem } from '@/types';
import { fadeUp, stagger, viewportOnce, EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import {
  calculateDistanceKm,
  getLocationHoursStatus,
} from '@/lib/locationUtils';
import { useToast } from '@/components/ui/use-toast';

// Dynamically import Leaflet Map (SSR disabled)
const LocationsMap = dynamic(() => import('@/components/locations/LocationsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-[#0e0e0e] border border-border/60 flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-[0.72rem] uppercase tracking-ultra text-muted-foreground font-mono">
        Connecting Club Network...
      </span>
    </div>
  ),
});

const CITIES = ['All', 'Taguig', 'Makati', 'Pasig', 'Alabang', 'Quezon City'] as const;

const AMENITY_FILTERS = [
  { id: 'Pool', label: 'Pool', icon: Waves },
  { id: 'Sauna', label: 'Sauna', icon: Flame },
  { id: 'Boxing Studio', label: 'Boxing Studio', icon: Shield },
  { id: 'Cycling Studio', label: 'Cycling Studio', icon: Bike },
  { id: 'Spa', label: 'Spa', icon: Sparkles },
  { id: 'Kids Club', label: 'Kids Club', icon: Smile },
  { id: '24/7 Access', label: '24/7 Access', icon: Clock },
] as const;

export default function Locations() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCity, setActiveCity] = useState<string>('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Map & Location Interaction
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.entities.Locations.list();
      setLocations(data || []);
      if (data && data.length > 0 && !selectedLocationId) {
        setSelectedLocationId(data[0].id);
      }
    } catch {
      setError('Unable to load our club locations directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Request user geolocation and sort by distance
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserCoords(coords);
        setIsLocating(false);
        toast({
          title: 'Location Acquired',
          description: 'Clubs sorted by proximity to your current position.',
        });
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Unable to determine your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Showing standard directory order.';
        }
        toast({
          title: 'Location Notice',
          description: msg,
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((a) => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  const clearAllFilters = () => {
    setActiveCity('All');
    setSelectedAmenities([]);
    setSearchQuery('');
  };

  // Filtered & Distance-Sorted Locations
  const processedLocations = useMemo(() => {
    let result = locations.filter((loc) => {
      // City filter
      if (activeCity !== 'All' && loc.city.toLowerCase() !== activeCity.toLowerCase()) {
        return false;
      }

      // Search query filter (matches name, city, neighborhood, address)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = loc.name.toLowerCase().includes(query);
        const matchesCity = loc.city.toLowerCase().includes(query);
        const matchesNeighborhood = loc.neighborhood?.toLowerCase().includes(query);
        const matchesAddress = loc.address.toLowerCase().includes(query);
        if (!matchesName && !matchesCity && !matchesNeighborhood && !matchesAddress) {
          return false;
        }
      }

      // Amenity filters (must have all selected amenities)
      if (selectedAmenities.length > 0) {
        const locAmenities = (loc.amenities || []).map((a) => a.toLowerCase());
        const hasAll = selectedAmenities.every((amenity) =>
          locAmenities.some((locA) => locA.includes(amenity.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      return true;
    });

    // If user coordinates exist, compute distance and sort by proximity
    if (
      userCoords &&
      typeof userCoords.latitude === 'number' &&
      typeof userCoords.longitude === 'number'
    ) {
      result = result
        .map((loc) => ({
          ...loc,
          _distance:
            typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
              ? calculateDistanceKm(
                  userCoords.latitude,
                  userCoords.longitude,
                  loc.latitude,
                  loc.longitude
                )
              : undefined,
        }))
        .sort((a, b) => (a._distance ?? Infinity) - (b._distance ?? Infinity));
    }

    return result;
  }, [locations, activeCity, searchQuery, selectedAmenities, userCoords]);

  const activeFiltersCount =
    (activeCity !== 'All' ? 1 : 0) +
    selectedAmenities.length +
    (searchQuery.trim() ? 1 : 0);

  return (
    <PageTransition>
      {/* 1. CINEMATIC HERO */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 md:px-12 border-b border-border/60 overflow-hidden bg-background">
        {/* Ambient Ken Burns Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920&q=80&auto=format"
            alt="Apex Club Network"
            fill
            priority
            sizes="100vw"
            className="object-cover animate-kenburns scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="text-[0.68rem] uppercase tracking-ultra font-mono text-primary font-medium px-3 py-1 border border-primary/30 bg-primary/5 inline-block mb-3">
              The Metropolitan Network
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-foreground font-normal tracking-tight">
              Sanctuaries of discipline.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base leading-relaxed">
              Six architectural clubhouses positioned across Metro Manila's most coveted enclaves.
              Engineered with Olympic platforms, thermal contrast suites, and private member lounges.
            </p>
          </motion.div>

          {/* Search Input Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="max-w-xl mx-auto pt-2"
          >
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-primary absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, neighborhood, or club..."
                className="w-full min-h-[48px] pl-11 pr-24 py-3 bg-card/80 backdrop-blur-md border border-border/70 text-foreground placeholder:text-muted-foreground text-xs uppercase tracking-wider focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  title="Sort by proximity"
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 text-[0.65rem] uppercase tracking-wider border font-mono transition-all',
                    userCoords
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/70 text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  <Compass className={cn('w-3 h-3', isLocating && 'animate-spin text-primary')} />
                  <span className="hidden sm:inline">
                    {isLocating ? 'Locating...' : userCoords ? 'Near You' : 'Locate'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FILTERS & CONTROLS BAR */}
      <section className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-md border-b border-border/60 py-3.5 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* City Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x-mandatory pb-1 lg:pb-0">
            <span className="text-[0.68rem] uppercase tracking-ultra font-mono text-muted-foreground hidden sm:inline mr-1 shrink-0">
              District:
            </span>
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={cn(
                  'min-h-[40px] px-4 py-2 text-[0.7rem] uppercase tracking-ultra transition-all select-none whitespace-nowrap shrink-0 snap-center border',
                  activeCity === city
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'border-border/60 bg-card/60 text-foreground/70 hover:text-foreground hover:border-border'
                )}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Desktop View Switcher & Clear Button */}
          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[0.68rem] uppercase tracking-wider text-primary hover:underline flex items-center gap-1 font-mono shrink-0"
              >
                <X className="w-3 h-3" />
                <span>Clear filters ({activeFiltersCount})</span>
              </button>
            )}

            {/* Sliding Pill View Indicator (Desktop) */}
            <div className="hidden lg:flex items-center p-1 border border-border/70 bg-card/80 rounded-none shrink-0">
              <button
                onClick={() => setViewMode('split')}
                className={cn(
                  'relative px-3.5 py-1.5 text-[0.68rem] uppercase tracking-wider transition-colors font-medium',
                  viewMode === 'split' ? 'text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {viewMode === 'split' && (
                  <motion.div
                    layoutId="desktopViewPill"
                    className="absolute inset-0 bg-primary z-0"
                    transition={{ duration: 0.25, ease: EASE }}
                  />
                )}
                <span className="relative z-10">Split (List + Map)</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'relative px-3.5 py-1.5 text-[0.68rem] uppercase tracking-wider transition-colors font-medium',
                  viewMode === 'list' ? 'text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {viewMode === 'list' && (
                  <motion.div
                    layoutId="desktopViewPill"
                    className="absolute inset-0 bg-primary z-0"
                    transition={{ duration: 0.25, ease: EASE }}
                  />
                )}
                <span className="relative z-10">List Only</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={cn(
                  'relative px-3.5 py-1.5 text-[0.68rem] uppercase tracking-wider transition-colors font-medium',
                  viewMode === 'map' ? 'text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {viewMode === 'map' && (
                  <motion.div
                    layoutId="desktopViewPill"
                    className="absolute inset-0 bg-primary z-0"
                    transition={{ duration: 0.25, ease: EASE }}
                  />
                )}
                <span className="relative z-10">Map View</span>
              </button>
            </div>

            {/* Mobile View Toggle Pill */}
            <div className="lg:hidden flex items-center p-0.5 border border-border/70 bg-card/80 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setMobileView('list')}
                className={cn(
                  'flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-[40px] px-4 text-[0.7rem] uppercase tracking-wider transition-colors font-medium',
                  mobileView === 'list' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'
                )}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setMobileView('map')}
                className={cn(
                  'flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-[40px] px-4 text-[0.7rem] uppercase tracking-wider transition-colors font-medium',
                  mobileView === 'map' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'
                )}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Amenity Filter Chips */}
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar snap-x-mandatory pb-1">
          <span className="text-[0.65rem] uppercase tracking-ultra font-mono text-muted-foreground shrink-0 mr-1 hidden sm:inline">
            Amenities:
          </span>
          {AMENITY_FILTERS.map(({ id, label, icon: Icon }) => {
            const isSelected = selectedAmenities.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleAmenity(id)}
                className={cn(
                  'min-h-[36px] px-3 py-1.5 text-[0.66rem] uppercase tracking-wider flex items-center gap-1.5 border transition-all shrink-0 snap-center select-none',
                  isSelected
                    ? 'border-primary bg-primary/15 text-primary font-semibold'
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <Icon className={cn('w-3 h-3', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                <span>{label}</span>
                {isSelected && <Check className="w-3 h-3 text-primary ml-0.5" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. MAIN CONTENT: DUAL LIST & MAP VIEW */}
      <section className="px-6 md:px-12 py-10 max-w-7xl mx-auto min-h-[600px]">
        {error ? (
          <div className="p-8 border border-border/60 text-center max-w-lg mx-auto my-16 bg-card">
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
          /* SKELETON LOADERS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-border/60 bg-card/40 space-y-4 animate-pulse p-4">
                  <div className="aspect-[16/10] w-full bg-muted/60" />
                  <div className="h-4 w-28 bg-muted" />
                  <div className="h-6 w-3/4 bg-muted" />
                  <div className="h-12 w-full bg-muted/40" />
                </div>
              ))}
            </div>
            <div className="hidden lg:block lg:col-span-6">
              <div className="h-[600px] w-full bg-muted/30 border border-border/60 animate-pulse" />
            </div>
          </div>
        ) : processedLocations.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-24 text-center max-w-md mx-auto space-y-4 border border-border/60 bg-card/40 p-8">
            <MapPin className="w-10 h-10 text-primary/70 mx-auto" />
            <h3 className="font-heading text-2xl text-foreground">No clubs match these filters</h3>
            <p className="text-muted-foreground text-sm">
              We couldn't find any sanctuaries matching your district or amenity selection.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-colors"
            >
              <span>Clear filters</span>
            </button>
          </div>
        ) : (
          /* RESPONSIVE LAYOUT */
          <div>
            {/* Desktop View Modes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Scrollable Card List */}
              <div
                className={cn(
                  'transition-all duration-300',
                  viewMode === 'list'
                    ? 'lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : viewMode === 'split'
                    ? 'lg:col-span-6 space-y-6'
                    : 'hidden' // When viewMode === 'map', hide list on desktop
                )}
              >
                {/* Mobile View Condition */}
                <div
                  className={cn(
                    'space-y-6',
                    mobileView === 'map' ? 'hidden lg:block' : 'block'
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {processedLocations.map((loc) => {
                      const isSelected = selectedLocationId === loc.id;
                      const status = getLocationHoursStatus(loc);
                      const distance =
                        userCoords &&
                        typeof userCoords.latitude === 'number' &&
                        typeof userCoords.longitude === 'number' &&
                        typeof loc.latitude === 'number' &&
                        typeof loc.longitude === 'number'
                          ? calculateDistanceKm(
                              userCoords.latitude,
                              userCoords.longitude,
                              loc.latitude,
                              loc.longitude
                            )
                          : null;

                      return (
                        <motion.article
                          key={loc.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          onMouseEnter={() => setSelectedLocationId(loc.id)}
                          onClick={() => setSelectedLocationId(loc.id)}
                          className={cn(
                            'group border bg-card/60 transition-all duration-300 relative overflow-hidden',
                            isSelected
                              ? 'border-primary shadow-lg ring-1 ring-primary/40'
                              : 'border-border/60 hover:border-border hover:-translate-y-0.5'
                          )}
                        >
                          {/* Image Container with slow zoom hover */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                            <Image
                              src={loc.photo}
                              alt={loc.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                            {/* District badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className="text-[0.64rem] uppercase tracking-ultra px-2.5 py-1 bg-black/80 backdrop-blur-md border border-primary/40 text-primary font-mono font-medium">
                                {loc.neighborhood || loc.city}
                              </span>
                            </div>

                            {/* Distance Badge if Geolocation is Active */}
                            {distance !== undefined && distance !== null && (
                              <div className="absolute top-3 right-3 text-[0.64rem] uppercase tracking-wider px-2 py-0.5 bg-black/85 backdrop-blur-md border border-sky-400/40 text-sky-400 font-mono">
                                {distance} km away
                              </div>
                            )}

                            {/* Live Hours Status Badge */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[0.7rem] font-mono px-2.5 py-1 bg-black/80 backdrop-blur-md border border-border/80">
                              <span
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  status.is24Hours
                                    ? 'bg-primary animate-pulse'
                                    : status.isOpen
                                    ? 'bg-emerald-400 animate-pulse'
                                    : 'bg-muted-foreground'
                                )}
                              />
                              <span
                                className={cn(
                                  status.is24Hours
                                    ? 'text-primary font-semibold'
                                    : status.isOpen
                                    ? 'text-emerald-400'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {status.statusText}
                              </span>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-5 md:p-6 space-y-4">
                            <div>
                              <h3 className="font-heading text-2xl font-normal text-foreground group-hover:text-primary transition-colors">
                                {loc.name}
                              </h3>
                              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{loc.address}</span>
                              </p>
                            </div>

                            <p className="text-foreground/75 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                              {loc.description}
                            </p>

                            {/* Amenity Badges */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {loc.amenities.slice(0, 4).map((amenity) => (
                                <span
                                  key={amenity}
                                  className="text-[0.65rem] uppercase tracking-wider px-2 py-1 bg-card border border-border/60 text-muted-foreground font-mono"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {loc.amenities.length > 4 && (
                                <span className="text-[0.65rem] uppercase tracking-wider px-1.5 py-1 text-primary font-mono">
                                  +{loc.amenities.length - 4} more
                                </span>
                              )}
                            </div>

                            {/* Action Row */}
                            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                              <div className="text-[0.7rem] font-mono text-muted-foreground">
                                {loc.stats ? `${loc.stats.sqft.toLocaleString()} sqft` : 'Private Club'}
                              </div>

                              <Link
                                to={`/locations/${loc.slug}`}
                                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-primary group-hover:text-primary transition-all relative overflow-hidden py-1 min-h-[44px]"
                              >
                                <span>View Club</span>
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                              </Link>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Sticky Map (Desktop) / Full Map View */}
              <div
                className={cn(
                  'transition-all duration-300',
                  viewMode === 'map'
                    ? 'lg:col-span-12 h-[calc(100vh-160px)] min-h-[600px]'
                    : viewMode === 'split'
                    ? 'hidden lg:block lg:col-span-6 lg:sticky lg:top-36 h-[calc(100vh-180px)] min-h-[550px]'
                    : 'hidden'
                )}
              >
                <div className="w-full h-full border border-border/70 shadow-2xl">
                  <LocationsMap
                    locations={processedLocations}
                    selectedLocationId={selectedLocationId}
                    onSelectLocation={(id) => setSelectedLocationId(id)}
                    userCoords={userCoords}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Full Screen Map (When mobileView === 'map') */}
            <div
              className={cn(
                'lg:hidden fixed inset-0 z-50 bg-background pt-20 pb-20 px-4 flex flex-col',
                mobileView === 'map' ? 'block' : 'hidden'
              )}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs uppercase tracking-wider font-mono text-primary font-semibold">
                  Club Map View ({processedLocations.length})
                </span>
                <button
                  onClick={() => setMobileView('list')}
                  className="px-3 py-1.5 border border-border text-[0.7rem] uppercase tracking-wider bg-card text-foreground"
                >
                  Back to List
                </button>
              </div>

              <div className="flex-1 w-full mt-3 overflow-hidden border border-border/70">
                <LocationsMap
                  locations={processedLocations}
                  selectedLocationId={selectedLocationId}
                  onSelectLocation={(id) => setSelectedLocationId(id)}
                  userCoords={userCoords}
                />
              </div>
            </div>

            {/* Mobile Floating "Map" Button (Pill at bottom) */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
              <button
                onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-ultra font-semibold shadow-2xl hover:scale-105 active:scale-95 transition-all border border-black/20"
              >
                {mobileView === 'list' ? (
                  <>
                    <MapIcon className="w-4 h-4" />
                    <span>View Map</span>
                  </>
                ) : (
                  <>
                    <ListIcon className="w-4 h-4" />
                    <span>View List</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>
    </PageTransition>
  );
}
