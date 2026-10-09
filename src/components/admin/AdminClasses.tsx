'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Dumbbell,
  Calendar,
  Clock,
  User,
  MapPin,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { ClassItem, ScheduleSlotItem, IntensityLevel, ClassLevel } from '@/types';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminClassesProps {
  classes: ClassItem[];
  scheduleSlots: ScheduleSlotItem[];
  onRefresh: () => void;
}

const CATEGORIES = ['All', 'Strength', 'HIIT', 'Cycling', 'Pilates', 'Yoga', 'Boxing', 'Recovery'];
const DAYS = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80&auto=format',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80&auto=format',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80&auto=format',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&q=80&auto=format',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=80&auto=format',
];

export default function AdminClasses({ classes, scheduleSlots, onRefresh }: AdminClassesProps) {
  const [subTab, setSubTab] = useState<'classes' | 'slots'>('classes');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');

  // Drawer state for Class
  const [classDrawerOpen, setClassDrawerOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [classForm, setClassForm] = useState<Partial<ClassItem>>({
    name: '',
    category: 'Strength',
    description: '',
    intensity: 'High',
    level: 'All Levels',
    duration: 50,
    trainer: 'Marcus Vance',
    capacity: 16,
    image_url: SAMPLE_IMAGES[0],
  });

  // Drawer state for Slot
  const [slotDrawerOpen, setSlotDrawerOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlotItem | null>(null);
  const [slotForm, setSlotForm] = useState<Partial<ScheduleSlotItem>>({
    class_name: 'Powerlifting Protocol',
    category: 'Strength',
    trainer: 'Marcus Vance',
    day: 'Mon',
    start_time: '07:00',
    end_time: '08:00',
    spots_remaining: 5,
    location: 'apex-bgc-flagship',
  });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'class' | 'slot'; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (selectedCategory !== 'All' && c.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mName = c.name.toLowerCase().includes(q);
        const mTrainer = c.trainer.toLowerCase().includes(q);
        const mDesc = c.description.toLowerCase().includes(q);
        if (!mName && !mTrainer && !mDesc) return false;
      }
      return true;
    });
  }, [classes, selectedCategory, search]);

  // Filtered slots
  const filteredSlots = useMemo(() => {
    return scheduleSlots.filter((s) => {
      if (selectedDay !== 'All' && s.day !== selectedDay) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mClass = s.class_name.toLowerCase().includes(q);
        const mTrainer = s.trainer.toLowerCase().includes(q);
        if (!mClass && !mTrainer) return false;
      }
      return true;
    });
  }, [scheduleSlots, selectedDay, search]);

  // Handle Class Drawer open
  const openClassDrawer = (item?: ClassItem) => {
    if (item) {
      setEditingClass(item);
      setClassForm({ ...item });
    } else {
      setEditingClass(null);
      setClassForm({
        name: '',
        category: 'Strength',
        description: '',
        intensity: 'High',
        level: 'All Levels',
        duration: 50,
        trainer: 'Marcus Vance',
        capacity: 16,
        image_url: SAMPLE_IMAGES[0],
      });
    }
    setClassDrawerOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name || !classForm.description) {
      toast.error('Please enter class name and description.');
      return;
    }

    try {
      if (editingClass) {
        await api.entities.Classes.update(editingClass.id, classForm);
        toast.success(`Updated class "${classForm.name}"`);
      } else {
        await api.entities.Classes.create({
          name: classForm.name!,
          category: classForm.category || 'Strength',
          description: classForm.description!,
          intensity: (classForm.intensity as IntensityLevel) || 'High',
          level: (classForm.level as ClassLevel) || 'All Levels',
          duration: Number(classForm.duration) || 50,
          trainer: classForm.trainer || 'Marcus Vance',
          capacity: Number(classForm.capacity) || 16,
          image_url: classForm.image_url || SAMPLE_IMAGES[0],
          image: classForm.image_url || SAMPLE_IMAGES[0],
        });
        toast.success(`Created class "${classForm.name}"`);
      }
      setClassDrawerOpen(false);
      onRefresh();
    } catch {
      toast.error('Failed to save class.');
    }
  };

  // Handle Slot Drawer open
  const openSlotDrawer = (slot?: ScheduleSlotItem) => {
    if (slot) {
      setEditingSlot(slot);
      setSlotForm({ ...slot });
    } else {
      setEditingSlot(null);
      setSlotForm({
        class_name: classes[0]?.name || 'Powerlifting Protocol',
        category: classes[0]?.category || 'Strength',
        trainer: classes[0]?.trainer || 'Marcus Vance',
        day: 'Mon',
        start_time: '07:00',
        end_time: '08:00',
        spots_remaining: 5,
        location: 'apex-bgc-flagship',
      });
    }
    setSlotDrawerOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.class_name || !slotForm.start_time) {
      toast.error('Please specify class name and start time.');
      return;
    }

    try {
      if (editingSlot) {
        await api.entities.ScheduleSlots.update(editingSlot.id, slotForm);
        toast.success('Updated schedule slot.');
      } else {
        await api.entities.ScheduleSlots.create({
          class_name: slotForm.class_name!,
          category: slotForm.category || 'Strength',
          trainer: slotForm.trainer || 'Marcus Vance',
          day: slotForm.day || 'Mon',
          start_time: slotForm.start_time!,
          end_time: slotForm.end_time || '08:00',
          spots_remaining: Number(slotForm.spots_remaining) || 4,
          location: slotForm.location || 'apex-bgc-flagship',
        });
        toast.success('Added schedule slot.');
      }
      setSlotDrawerOpen(false);
      onRefresh();
    } catch {
      toast.error('Failed to save schedule slot.');
    }
  };

  // Delete handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'class') {
        await api.entities.Classes.delete(deleteTarget.id);
        toast.success(`Class "${deleteTarget.name}" deleted.`);
      } else {
        await api.entities.ScheduleSlots.delete(deleteTarget.id);
        toast.success('Schedule slot deleted.');
      }
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error('Failed to perform deletion.');
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
            onClick={() => setSubTab('classes')}
            className={cn(
              'px-4 py-2 text-xs uppercase tracking-wider font-mono transition-all',
              subTab === 'classes'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Masterclasses ({classes.length})
          </button>
          <button
            onClick={() => setSubTab('slots')}
            className={cn(
              'px-4 py-2 text-xs uppercase tracking-wider font-mono transition-all',
              subTab === 'slots'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Weekly Schedule Slots ({scheduleSlots.length})
          </button>
        </div>

        <button
          onClick={() => (subTab === 'classes' ? openClassDrawer() : openSlotDrawer())}
          className="min-h-[44px] px-4 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-mono font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>{subTab === 'classes' ? 'Add Masterclass' : 'Add Schedule Slot'}</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              subTab === 'classes'
                ? 'Search class name, trainer, description...'
                : 'Search class or trainer...'
            }
            className="w-full min-h-[44px] pl-10 pr-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {subTab === 'classes' ? (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-h-[44px] px-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#121212] text-foreground">
                {cat === 'All' ? 'All Modalities' : cat}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="min-h-[44px] px-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            {DAYS.map((d) => (
              <option key={d} value={d} className="bg-[#121212] text-foreground">
                {d === 'All' ? 'All Days' : d}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content Section: Classes View */}
      {subTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="border border-border/70 bg-card/50 overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-colors"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={cls.image_url || cls.image || SAMPLE_IMAGES[0]}
                  alt={cls.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 border border-primary/40 text-primary text-[0.62rem] uppercase tracking-wider font-mono">
                  {cls.category}
                </span>
                <span className="absolute bottom-2.5 left-2.5 text-xs text-white/90 font-mono">
                  {cls.duration} min · {cls.intensity}
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{cls.name}</h3>
                  <p className="text-[0.72rem] text-muted-foreground line-clamp-2 mt-1">
                    {cls.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <div>Coach: <span className="text-foreground">{cls.trainer}</span></div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openClassDrawer(cls)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      title="Edit Class"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'class', id: cls.id, name: cls.name })}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                      title="Delete Class"
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

      {/* Content Section: Schedule Slots View */}
      {subTab === 'slots' && (
        <div className="border border-border/70 bg-card/50 overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-border/70 bg-muted/20 text-muted-foreground uppercase text-[0.66rem] tracking-wider">
              <tr>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Trainer</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Spots</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-card/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-primary">{slot.day}</td>
                  <td className="py-3 px-4 text-foreground">
                    {slot.start_time} – {slot.end_time}
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">{slot.class_name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{slot.trainer}</td>
                  <td className="py-3 px-4 text-muted-foreground text-[0.7rem]">
                    {slot.location || 'apex-bgc-flagship'}
                  </td>
                  <td className="py-3 px-4 text-primary font-bold">{slot.spots_remaining} left</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openSlotDrawer(slot)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors mr-1"
                      title="Edit Slot"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ type: 'slot', id: slot.id, name: `${slot.class_name} (${slot.day})` })
                      }
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Class Form Side Drawer */}
      {classDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setClassDrawerOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#141414] border-l border-border/80 h-full p-6 sm:p-8 z-10 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {editingClass ? 'Edit Masterclass' : 'Add New Masterclass'}
              </h3>
              <button
                onClick={() => setClassDrawerOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  value={classForm.name || ''}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g. Hardstyle Kettlebell Protocol"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Category</label>
                  <select
                    value={classForm.category || 'Strength'}
                    onChange={(e) => setClassForm({ ...classForm, category: e.target.value })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Intensity</label>
                  <select
                    value={classForm.intensity || 'High'}
                    onChange={(e) =>
                      setClassForm({ ...classForm, intensity: e.target.value as IntensityLevel })
                    }
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={classForm.duration || 50}
                    onChange={(e) => setClassForm({ ...classForm, duration: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Capacity</label>
                  <input
                    type="number"
                    value={classForm.capacity || 16}
                    onChange={(e) => setClassForm({ ...classForm, capacity: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Lead Coach</label>
                <input
                  type="text"
                  value={classForm.trainer || ''}
                  onChange={(e) => setClassForm({ ...classForm, trainer: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={classForm.image_url || ''}
                  onChange={(e) => setClassForm({ ...classForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
                  {SAMPLE_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setClassForm({ ...classForm, image_url: img })}
                      className="w-12 h-8 relative border border-border shrink-0 overflow-hidden hover:border-primary"
                    >
                      <Image src={img} alt="Preset" fill sizes="48px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={classForm.description || ''}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  placeholder="Program overview and athletic intent..."
                  className="w-full p-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setClassDrawerOpen(false)}
                  className="min-h-[44px] px-4 py-2 border border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Save Masterclass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slot Form Side Drawer */}
      {slotDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSlotDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#141414] border-l border-border/80 h-full p-6 sm:p-8 z-10 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {editingSlot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
              </h3>
              <button
                onClick={() => setSlotDrawerOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Class</label>
                <input
                  type="text"
                  required
                  value={slotForm.class_name || ''}
                  onChange={(e) => setSlotForm({ ...slotForm, class_name: e.target.value })}
                  placeholder="e.g. Powerlifting Protocol"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Coach</label>
                <input
                  type="text"
                  value={slotForm.trainer || ''}
                  onChange={(e) => setSlotForm({ ...slotForm, trainer: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Day of Week</label>
                  <select
                    value={slotForm.day || 'Mon'}
                    onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  >
                    {DAYS.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Spots Left</label>
                  <input
                    type="number"
                    value={slotForm.spots_remaining || 4}
                    onChange={(e) => setSlotForm({ ...slotForm, spots_remaining: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={slotForm.start_time || '07:00'}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">End Time</label>
                  <input
                    type="time"
                    value={slotForm.end_time || '08:00'}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Club Location Slug</label>
                <select
                  value={slotForm.location || 'apex-bgc-flagship'}
                  onChange={(e) => setSlotForm({ ...slotForm, location: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="apex-bgc-flagship">apex-bgc-flagship (BGC)</option>
                  <option value="apex-makati-sanctuary">apex-makati-sanctuary (Salcedo)</option>
                  <option value="apex-rockwell-club">apex-rockwell-club (Rockwell)</option>
                  <option value="apex-ortigas-sky">apex-ortigas-sky (Ortigas)</option>
                  <option value="apex-alabang-west">apex-alabang-west (Alabang)</option>
                  <option value="apex-new-manila">apex-new-manila (New Manila)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSlotDrawerOpen(false)}
                  className="min-h-[44px] px-4 py-2 border border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Save Timetable Slot
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

