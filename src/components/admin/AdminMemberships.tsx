'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Trash2,
  Mail,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { MembershipSignupData } from '@/types';
import { api } from '@/api/client';
import { exportToCsv } from '@/lib/csvExport';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminMembershipsProps {
  signups: MembershipSignupData[];
  onRefresh: () => void;
}

const PLAN_FILTERS = ['All', 'Essential', 'Plus', 'Elite', 'Black Card'] as const;
const STATUS_OPTIONS = ['active', 'pending', 'cancelled'] as const;

export default function AdminMemberships({ signups, onRefresh }: AdminMembershipsProps) {
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [deleteTarget, setDeleteTarget] = useState<MembershipSignupData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return signups.filter((s) => {
      if (selectedPlan !== 'All') {
        if (!s.plan_name?.toLowerCase().includes(selectedPlan.toLowerCase())) return false;
      }
      if (selectedStatus !== 'All') {
        if (s.status?.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [signups, search, selectedPlan, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.entities.MembershipSignups.update(id, { status: newStatus });
      toast.success(`Membership status updated to ${newStatus}`);
      onRefresh();
    } catch {
      toast.error('Failed to update membership status.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setDeleting(true);
    try {
      await api.entities.MembershipSignups.delete(deleteTarget.id);
      toast.success('Membership record removed.');
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error('Failed to remove membership record.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Signup ID',
      'Member Name',
      'Email',
      'Plan Tier',
      'Billing Cycle',
      'Status',
      'Registered Date',
    ];

    const rows = filtered.map((s) => [
      s.id || '',
      s.name,
      s.email,
      s.plan_name,
      s.billing_cycle,
      s.status || 'active',
      s.created_at || '',
    ]);

    exportToCsv(`apex-membership-signups-${new Date().toISOString().split('T')[0]}`, headers, rows);
    toast.success(`Exported ${filtered.length} memberships to CSV`);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Controls Bar */}
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
            placeholder="Search member name, email..."
            className="w-full min-h-[44px] pl-10 pr-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedPlan}
            onChange={(e) => {
              setSelectedPlan(e.target.value);
              setPage(1);
            }}
            className="min-h-[44px] px-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            {PLAN_FILTERS.map((plan) => (
              <option key={plan} value={plan} className="bg-[#121212] text-foreground">
                {plan === 'All' ? 'All Plans' : `${plan} Tier`}
              </option>
            ))}
          </select>

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
                {st.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            className="min-h-[44px] px-4 py-2 border border-primary/40 bg-primary/10 text-primary text-xs uppercase tracking-wider font-mono hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table / Mobile Cards */}
      {paginated.length === 0 ? (
        <div className="p-12 text-center border border-border/60 bg-card/40 space-y-3">
          <AlertCircle className="w-8 h-8 text-primary/60 mx-auto" />
          <h3 className="font-heading text-lg text-foreground">No membership signups found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto font-mono">
            Adjust your plan selection or search criteria.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block border border-border/70 bg-card/50 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border/70 bg-muted/20 text-muted-foreground uppercase text-[0.66rem] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Billing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginated.map((s) => (
                  <tr key={s.id} className="hover:bg-card/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground text-xs">{s.name}</div>
                      <div className="text-[0.68rem] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-primary shrink-0" />
                        <span>{s.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 text-[0.68rem] font-bold border uppercase tracking-wider',
                          s.plan_name === 'Black Card'
                            ? 'bg-neutral-900 border-primary text-primary shadow-sm'
                            : s.plan_name === 'Elite'
                            ? 'bg-primary/20 border-primary/50 text-primary'
                            : 'bg-card border-border/80 text-foreground'
                        )}
                      >
                        {s.plan_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      <div className="capitalize flex items-center gap-1 text-foreground">
                        <CreditCard className="w-3 h-3 text-primary" />
                        <span>{s.billing_cycle}</span>
                      </div>
                      <div className="text-[0.62rem] text-muted-foreground">
                        {s.billing_cycle === 'annual' ? '20% prepay discount' : 'Monthly renewal'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={s.status || 'active'}
                        onChange={(e) => s.id && handleStatusChange(s.id, e.target.value)}
                        className={cn(
                          'px-2 py-1 text-[0.68rem] font-bold border uppercase tracking-wider focus:outline-none cursor-pointer',
                          s.status === 'active'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                            : s.status === 'pending'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                            : 'bg-red-500/15 border-red-500/40 text-red-400'
                        )}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st} className="bg-[#141414] text-foreground font-mono">
                            {st.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-950/20 transition-colors"
                        title="Remove Membership"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="lg:hidden space-y-3.5">
            {paginated.map((s) => (
              <div key={s.id} className="p-4 border border-border/70 bg-card/60 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-heading text-base font-semibold text-foreground">{s.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{s.email}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 text-[0.68rem] font-bold border uppercase tracking-wider',
                      s.plan_name === 'Black Card'
                        ? 'bg-neutral-900 border-primary text-primary'
                        : s.plan_name === 'Elite'
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-card border-border/80 text-foreground'
                    )}
                  >
                    {s.plan_name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-border/50">
                  <div className="capitalize text-foreground flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                    <span>{s.billing_cycle} billing</span>
                  </div>

                  <select
                    value={s.status || 'active'}
                    onChange={(e) => s.id && handleStatusChange(s.id, e.target.value)}
                    className={cn(
                      'min-h-[44px] px-2.5 py-1 text-[0.68rem] font-bold border uppercase tracking-wider focus:outline-none cursor-pointer',
                      s.status === 'active'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    )}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st} className="bg-[#141414] text-foreground font-mono">
                        {st.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-border/50 flex justify-end">
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="min-h-[44px] px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 flex items-center gap-1.5 font-mono"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
                Confirm Membership Deletion
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              Are you sure you wish to delete the membership record for{' '}
              <strong className="text-foreground">{deleteTarget.name}</strong>?
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
                {deleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

