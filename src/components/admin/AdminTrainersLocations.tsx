'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  MapPin,
  Clock,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { TrainerItem, LocationItem } from '@/types';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminTrainersLocationsProps {
  trainers: TrainerItem[];
  locations: LocationItem[];
  onRefresh: () => void;
  initialSubTab?: 'trainers' | 'locations';
}

export default function AdminTrainersLocations({
  trainers,
  locations,
  onRefresh,
  initialSubTab = 'trainers',
}: AdminTrainersLocationsProps) {
  const [subTab, setSubTab] = useState<'trainers' | 'locations'>(initialSubTab);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Trainer Drawer
  const [trainerDrawerOpen, setTrainerDrawerOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<TrainerItem | null>(null);
  const [trainerForm, setTrainerForm] = useState<Partial<TrainerItem>>({
    name: '',
    role: '',
    bio: '',
    specialties: ['Strength', 'Conditioning'],
    experience_years: 8,
    order: 1,
    image_url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80&auto=format',
  });
  const [specialtiesText, setSpecialtiesText] = useState('Strength, Conditioning');

  // Location Drawer
  const [locationDrawerOpen, setLocationDrawerOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [locationForm, setLocationForm] = useState<Partial<LocationItem>>({
    name: '',
    slug: '',
    city: 'Taguig',
    neighborhood: 'Bonifacio Global City',
    address: '',
    phone: '+63 (2) 8889-2739',
    email: 'bgc@apexfitness.ph',
    hours: 'Monday — Sunday: 05:00 — 23:00',
    description: '',
    latitude: 14.5507,
    longitude: 121.0504,
  });
  const [amenitiesText, setAmenitiesText] = useState('Pool, Sauna, Boxing Studio, Cycling Studio, Spa, 24/7 Access');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'trainer' | 'location';
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtered trainers
  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mName = t.name.toLowerCase().includes(q);
        const mRole = t.role.toLowerCase().includes(q);
        if (!mName && !mRole) return false;
      }
      return true;
    });
  }, [trainers, search]);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter((l) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mName = l.name.toLowerCase().includes(q);
        const mCity = l.city.toLowerCase().includes(q);
        const mAddr = l.address.toLowerCase().includes(q);
        if (!mName && !mCity && !mAddr) return false;
      }
      return true;
    });
  }, [locations, search]);

  // Open Trainer Drawer
  const openTrainerDrawer = (t?: TrainerItem) => {
    if (t) {
      setEditingTrainer(t);
      setTrainerForm({ ...t });
      setSpecialtiesText((t.specialties || []).join(', '));
    } else {
      setEditingTrainer(null);
      setTrainerForm({
        name: '',
        role: 'Master Strength Coach',
        bio: '',
        specialties: ['Strength', 'Olympic Lifting'],
        experience_years: 8,
        order: trainers.length + 1,
        image_url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80&auto=format',
      });
      setSpecialtiesText('Strength, Olympic Lifting');
    }
    setTrainerDrawerOpen(true);
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerForm.name || !trainerForm.role) {
      toast.error('Please enter trainer name and role.');
      return;
    }

    const specs = specialtiesText.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      if (editingTrainer) {
        await api.entities.Trainers.update(editingTrainer.id, {
          ...trainerForm,
          specialties: specs,
        });
        toast.success(`Updated coach "${trainerForm.name}"`);
      } else {
        await api.entities.Trainers.create({
          name: trainerForm.name!,
          role: trainerForm.role!,
          bio: trainerForm.bio || 'Elite athletic coach specializing in neurological performance.',
          specialties: specs,
          experience_years: Number(trainerForm.experience_years) || 8,
          order: Number(trainerForm.order) || trainers.length + 1,
          image_url: trainerForm.image_url || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80&auto=format',
        });
        toast.success(`Added coach "${trainerForm.name}"`);
      }
      setTrainerDrawerOpen(false);
      onRefresh();
    } catch {
      toast.error('Failed to save trainer.');
    }
  };

  // Open Location Drawer
  const openLocationDrawer = (l?: LocationItem) => {
    if (l) {
      setEditingLocation(l);
      setLocationForm({ ...l });
      setAmenitiesText((l.amenities || []).join(', '));
    } else {
      setEditingLocation(null);
      setLocationForm({
        name: '',
        slug: '',
        city: 'Taguig',
        neighborhood: 'Bonifacio Global City',
        address: '',
        phone: '+63 (2) 8889-2739',
        email: 'concierge@apexfitness.ph',
        hours: 'Monday — Sunday: 05:00 — 23:00',
        description: '',
        latitude: 14.5507,
        longitude: 121.0504,
      });
      setAmenitiesText('Pool, Sauna, Boxing Studio, Cycling Studio, Spa, 24/7 Access');
    }
    setLocationDrawerOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationForm.name || !locationForm.address) {
      toast.error('Please specify clubhouse name and address.');
      return;
    }

    const ams = amenitiesText.split(',').map((a) => a.trim()).filter(Boolean);
    const slug =
      locationForm.slug ||
      locationForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (editingLocation) {
        await api.entities.Locations.update(editingLocation.id, {
          ...locationForm,
          amenities: ams,
          slug,
        });
        toast.success(`Updated location "${locationForm.name}"`);
      } else {
        await api.entities.Locations.create({
          name: locationForm.name!,
          slug,
          city: locationForm.city || 'Taguig',
          neighborhood: locationForm.neighborhood || 'Bonifacio Global City',
          address: locationForm.address!,
          phone: locationForm.phone || '+63 (2) 8889-2739',
          email: locationForm.email || 'concierge@apexfitness.ph',
          hours: locationForm.hours || 'Monday — Sunday: 05:00 — 23:00',
          description: locationForm.description || 'Our metropolitan athletic cathedral.',
          latitude: Number(locationForm.latitude) || 14.5507,
          longitude: Number(locationForm.longitude) || 121.0504,
          amenities: ams,
          stats: { sqft: 16000, studios: 3, trainers: 12 },
          photo: locations[0]?.photo || 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80&auto=format',
          hero_image: locations[0]?.hero_image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&q=85&auto=format',
          gallery: locations[0]?.gallery || [],
        });
        toast.success(`Created location "${locationForm.name}"`);
      }
      setLocationDrawerOpen(false);
      onRefresh();
    } catch {
      toast.error('Failed to save location.');
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'trainer') {
        await api.entities.Trainers.delete(deleteTarget.id);
        toast.success(`Coach "${deleteTarget.name}" removed.`);
      } else {
        await api.entities.Locations.delete(deleteTarget.id);
        toast.success(`Location "${deleteTarget.name}" removed.`);
      }
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error('Failed to remove record.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3 flex-wrap gap-4">
        <div className="flex items-center p-1 border border-border/70 bg-card/60">
          <button
            onClick={() => setSubTab('trainers')}
            className={cn(
              'px-4 py-2 text-xs uppercase tracking-wider font-mono transition-all',
              subTab === 'trainers'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Tier-1 Coaches ({trainers.length})
          </button>
          <button
            onClick={() => setSubTab('locations')}
            className={cn(
              'px-4 py-2 text-xs uppercase tracking-wider font-mono transition-all',
              subTab === 'locations'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Club Sanctuaries ({locations.length})
          </button>
        </div>

        <button
          onClick={() => (subTab === 'trainers' ? openTrainerDrawer() : openLocationDrawer())}
          className="min-h-[44px] px-4 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-mono font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>{subTab === 'trainers' ? 'Add Coach' : 'Add Club Sanctuary'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={subTab === 'trainers' ? 'Search coach name or role...' : 'Search club name or city...'}
          className="w-full min-h-[44px] pl-10 pr-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Content 1: Trainers Grid */}
      {subTab === 'trainers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrainers.map((t) => (
            <div
              key={t.id}
              className="border border-border/70 bg-card/50 overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-colors"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={t.image_url}
                  alt={t.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 text-xs text-white/90 font-mono">
                  {t.experience_years} Years Experience
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{t.name}</h3>
                  <p className="text-xs text-primary font-mono mt-0.5">{t.role}</p>
                  <p className="text-[0.72rem] text-muted-foreground line-clamp-2 mt-2">{t.bio}</p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <div className="text-[0.68rem] text-muted-foreground truncate max-w-[150px]">
                    {t.specialties?.join(', ')}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openTrainerDrawer(t)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      title="Edit Coach"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'trainer', id: t.id, name: t.name })}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                      title="Delete Coach"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content 2: Locations Grid */}
      {subTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="border border-border/70 bg-card/50 overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-colors"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={loc.photo}
                  alt={loc.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 border border-primary/40 text-primary text-[0.62rem] uppercase tracking-wider font-mono">
                  {loc.neighborhood || loc.city}
                </span>
                <span className="absolute bottom-2.5 left-2.5 text-xs text-white/90 font-mono">
                  {loc.stats?.sqft.toLocaleString()} SQFT · {loc.stats?.studios} Studios
                </span>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-foreground">{loc.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{loc.address}</span>
                  </p>
                  <p className="text-[0.72rem] text-muted-foreground/80 flex items-center gap-1.5 mt-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{loc.hours}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="text-primary font-bold">{loc.slug}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openLocationDrawer(loc)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      title="Edit Location"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'location', id: loc.id, name: loc.name })}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                      title="Delete Location"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trainer Drawer Form */}
      {trainerDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setTrainerDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-[#141414] border-l border-border/80 h-full p-6 sm:p-8 z-10 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {editingTrainer ? 'Edit Master Coach' : 'Add Master Coach'}
              </h3>
              <button onClick={() => setTrainerDrawerOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrainer} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={trainerForm.name || ''}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                  placeholder="e.g. Jax Thorne"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Role / Designation</label>
                <input
                  type="text"
                  required
                  value={trainerForm.role || ''}
                  onChange={(e) => setTrainerForm({ ...trainerForm, role: e.target.value })}
                  placeholder="e.g. Combat Arts & Boxing Director"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={trainerForm.experience_years || 8}
                    onChange={(e) => setTrainerForm({ ...trainerForm, experience_years: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={trainerForm.order || 1}
                    onChange={(e) => setTrainerForm({ ...trainerForm, order: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Specialties (comma separated)</label>
                <input
                  type="text"
                  value={specialtiesText}
                  onChange={(e) => setSpecialtiesText(e.target.value)}
                  placeholder="Powerlifting, Boxing, Biomechanics"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Portrait Image URL</label>
                <input
                  type="url"
                  value={trainerForm.image_url || ''}
                  onChange={(e) => setTrainerForm({ ...trainerForm, image_url: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Biography</label>
                <textarea
                  rows={4}
                  value={trainerForm.bio || ''}
                  onChange={(e) => setTrainerForm({ ...trainerForm, bio: e.target.value })}
                  placeholder="Athletic background and coaching philosophy..."
                  className="w-full p-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTrainerDrawerOpen(false)}
                  className="min-h-[44px] px-4 py-2 border border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Save Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Drawer Form */}
      {locationDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setLocationDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141414] border-l border-border/80 h-full p-6 sm:p-8 z-10 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {editingLocation ? 'Edit Club Sanctuary' : 'Add Club Sanctuary'}
              </h3>
              <button onClick={() => setLocationDrawerOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Club Name</label>
                <input
                  type="text"
                  required
                  value={locationForm.name || ''}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  placeholder="e.g. Apex Flagship BGC"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">City / District</label>
                  <input
                    type="text"
                    required
                    value={locationForm.city || ''}
                    onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                    placeholder="Taguig"
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Neighborhood</label>
                  <input
                    type="text"
                    value={locationForm.neighborhood || ''}
                    onChange={(e) => setLocationForm({ ...locationForm, neighborhood: e.target.value })}
                    placeholder="Bonifacio Global City"
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={locationForm.address || ''}
                  onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                  placeholder="8F, The Apex Tower, 9th Avenue..."
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Phone</label>
                  <input
                    type="text"
                    value={locationForm.phone || ''}
                    onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Email</label>
                  <input
                    type="email"
                    value={locationForm.email || ''}
                    onChange={(e) => setLocationForm({ ...locationForm, email: e.target.value })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Hours String</label>
                <input
                  type="text"
                  value={locationForm.hours || ''}
                  onChange={(e) => setLocationForm({ ...locationForm, hours: e.target.value })}
                  placeholder="Open 24/7 or Monday — Sunday: 05:00 — 23:00"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={amenitiesText}
                  onChange={(e) => setAmenitiesText(e.target.value)}
                  placeholder="Pool, Sauna, Boxing Studio, Cycling Studio, Spa, 24/7 Access"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Editorial Description</label>
                <textarea
                  rows={3}
                  value={locationForm.description || ''}
                  onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
                  className="w-full p-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLocationDrawerOpen(false)}
                  className="min-h-[44px] px-4 py-2 border border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Save Club Sanctuary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-border/80 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              Are you sure you wish to delete <strong className="text-foreground">{deleteTarget.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="min-h-[44px] px-4 py-2 border border-border text-xs uppercase tracking-wider font-mono hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="min-h-[44px] px-5 py-2 bg-red-600 text-white text-xs uppercase tracking-wider font-mono font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
