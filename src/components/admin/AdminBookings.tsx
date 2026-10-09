'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { TourBookingData } from '@/types';
import { api } from '@/api/client';
import { exportToCsv } from '@/lib/csvExport';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminBookingsProps {
  bookings: TourBookingData[];
  onRefresh: () => void;
}

const STATUS_OPTIONS = ['New', 'Contacted', 'Completed', 'Cancelled'] as const;
const LOCATIONS = [
  'All',
  'Apex Flagship BGC',
  'Apex Sanctuary Makati',
  'Apex Rockwell Club',
  'Apex Performance Ortigas',
  'Apex Alabang West',
  'Apex New Manila',
];

export default function AdminBookings({ bookings, onRefresh }: AdminBookingsProps) {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<TourBookingData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtered list
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedLocation !== 'All') {
        if (!b.preferred_location?.toLowerCase().includes(selectedLocation.toLowerCase().replace('apex ', ''))) {
          return false;
        }
      }
      if (selectedStatus !== 'All') {
        if (b.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesEmail = b.email.toLowerCase().includes(q);
        const matchesPhone = b.phone?.toLowerCase().includes(q);
        const matchesInterest = b.interest.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesInterest) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, search, selectedLocation, selectedStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Inline Status Change (Optimistic)
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.entities.TourBookings.update(id, { status: newStatus });
      toast.success(`Booking status changed to ${newStatus}`);
      onRefresh();
    } catch {
      toast.error('Failed to update booking status.');
    }
  };

  // Delete handler
  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setDeleting(true);
    try {
      await api.entities.TourBookings.delete(deleteTarget.id);
      toast.success('Tour booking removed.');
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error('Failed to remove tour booking.');
    } finally {
      setDeleting(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Booking ID',
      'Guest Name',
      'Email',
      'Phone',
      'Preferred Location',
      'Preferred Date',
      'Preferred Time',
      'Interest',
      'Status',
      'Notes',
      'Created At',
    ];

    const rows = filtered.map((b) => [
      b.id || '',
      b.name,
      b.email,
      b.phone || '',
      b.preferred_location || '',
      b.preferred_date,
      b.preferred_time,
      b.interest,
      b.status || 'New',
      b.notes || '',
      b.created_at || '',
    ]);

    exportToCsv(`apex-tour-bookings-${new Date().toISOString().split('T')[0]}`, headers, rows);
    toast.success(`Exported ${filtered.length} bookings to CSV`);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search guest name, email, phone..."
            className="w-full min-h-[44px] pl-10 pr-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Location filter */}
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setPage(1);
            }}
            className="min-h-[44px] px-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc} className="bg-[#121212] text-foreground">
                {loc === 'All' ? 'All Clubhouses' : loc}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="min-h-[44px] px-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All" className="bg-[#121212] text-foreground">
              All Statuses
            </option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st} className="bg-[#121212] text-foreground">
                {st}
              </option>
            ))}
          </select>

          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            className="min-h-[44px] px-4 py-2 border border-primary/40 bg-primary/10 text-primary text-xs uppercase tracking-wider font-mono hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table / Mobile Cards */}
      {paginated.length === 0 ? (
        <div className="p-12 text-center border border-border/60 bg-card/40 space-y-3">
          <AlertCircle className="w-8 h-8 text-primary/60 mx-auto" />
          <h3 className="font-heading text-lg text-foreground">No tour bookings found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search criteria, club location, or status filter.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block border border-border/70 bg-card/50 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border/70 bg-muted/20 text-muted-foreground uppercase text-[0.66rem] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Clubhouse</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Training Interest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginated.map((b) => (
                  <tr key={b.id} className="hover:bg-card/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground text-xs">{b.name}</div>
                      <div className="text-[0.68rem] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-primary shrink-0" />
                        <span>{b.email}</span>
                      </div>
                      {b.phone && (
                        <div className="text-[0.68rem] text-muted-foreground/80 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{b.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      <span className="text-foreground">{b.preferred_location || 'Flagship BGC'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      <div className="text-foreground">{b.preferred_date}</div>
                      <div className="text-[0.68rem] text-primary">{b.preferred_time}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-card border border-border/70 text-foreground text-[0.68rem] line-clamp-1">
                        {b.interest}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={b.status || 'New'}
                        onChange={(e) => b.id && handleStatusChange(b.id, e.target.value)}
                        className={cn(
                          'px-2 py-1 text-[0.68rem] font-bold border uppercase tracking-wider focus:outline-none cursor-pointer',
                          b.status === 'Completed'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                            : b.status === 'Contacted'
                            ? 'bg-sky-500/15 border-sky-500/40 text-sky-400'
                            : b.status === 'Cancelled'
                            ? 'bg-red-500/15 border-red-500/40 text-red-400'
                            : 'bg-primary/15 border-primary/40 text-primary'
                        )}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st} className="bg-[#141414] text-foreground font-mono">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(b)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-950/20 transition-colors"
                        title="Delete Tour Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View */}
          <div className="lg:hidden space-y-3.5">
            {paginated.map((b) => (
              <div
                key={b.id}
                className="p-4 border border-border/70 bg-card/60 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-heading text-base font-semibold text-foreground">
                      {b.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{b.email}</p>
                    {b.phone && (
                      <p className="text-xs text-muted-foreground/80 font-mono">{b.phone}</p>
                    )}
                  </div>

                  <select
                    value={b.status || 'New'}
                    onChange={(e) => b.id && handleStatusChange(b.id, e.target.value)}
                    className={cn(
                      'min-h-[44px] px-2.5 py-1 text-[0.68rem] font-bold border uppercase tracking-wider focus:outline-none cursor-pointer',
                      b.status === 'Completed'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : b.status === 'Contacted'
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-400'
                        : b.status === 'Cancelled'
                        ? 'bg-red-500/15 border-red-500/40 text-red-400'
                        : 'bg-primary/15 border-primary/40 text-primary'
                    )}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st} className="bg-[#141414] text-foreground font-mono">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs font-mono space-y-1 text-muted-foreground pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{b.preferred_location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      {b.preferred_date} · {b.preferred_time}
                    </span>
                  </div>
                  <div className="text-primary font-semibold text-[0.7rem] pt-1">
                    Interest: {b.interest}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex justify-end">
                  <button
                    onClick={() => setDeleteTarget(b)}
                    className="min-h-[44px] px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 flex items-center gap-1.5 font-mono"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Bar */}
          <div className="flex items-center justify-between border-t border-border/60 pt-4 font-mono text-xs">
            <span className="text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="min-h-[44px] min-w-[44px] p-2 border border-border/70 bg-card/60 text-muted-foreground hover:text-foreground disabled:opacity-40 flex items-center justify-center"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-primary font-bold">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="min-h-[44px] min-w-[44px] p-2 border border-border/70 bg-card/60 text-muted-foreground hover:text-foreground disabled:opacity-40 flex items-center justify-center"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
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
              Are you sure you wish to delete the tour booking for{' '}
              <strong className="text-foreground">{deleteTarget.name}</strong>? This action will
              permanently remove the inquiry from the database.
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
                {deleting ? 'Deleting...' : 'Delete Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

