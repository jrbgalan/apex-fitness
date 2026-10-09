'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Trash2,
  MailCheck,
  Plus,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { NewsletterSubscriberData } from '@/types';
import { api } from '@/api/client';
import { exportToCsv } from '@/lib/csvExport';
import { toast } from 'sonner';

interface AdminSubscribersProps {
  subscribers: NewsletterSubscriberData[];
  onRefresh: () => void;
}

export default function AdminSubscribers({
  subscribers,
  onRefresh,
}: AdminSubscribersProps) {
  const [search, setSearch] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriberData | null>(null);

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (search.trim()) {
        return s.email.toLowerCase().includes(search.toLowerCase().trim());
      }
      return true;
    });
  }, [subscribers, search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setAdding(true);
    try {
      await api.entities.NewsletterSubscribers.create({ email: newEmail });
      toast.success(`Subscribed "${newEmail}"`);
      setNewEmail('');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to subscribe.');
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    try {
      await api.entities.NewsletterSubscribers.delete(deleteTarget.id);
      toast.success('Subscriber removed.');
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error('Failed to remove subscriber.');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Subscriber ID', 'Email Address', 'Subscription Date'];
    const rows = filtered.map((s) => [s.id || '', s.email, s.created_at || '']);
    exportToCsv(`apex-subscribers-${new Date().toISOString().split('T')[0]}`, headers, rows);
    toast.success(`Exported ${filtered.length} subscribers to CSV`);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriber emails..."
            className="w-full min-h-[44px] pl-10 pr-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <button
          onClick={handleExportCsv}
          className="min-h-[44px] px-4 py-2 border border-primary/40 bg-primary/10 text-primary text-xs uppercase tracking-wider font-mono hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV ({filtered.length})</span>
        </button>
      </div>

      {/* Manual Add Input */}
      <form onSubmit={handleAdd} className="flex gap-2 max-w-md">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Add subscriber email manually..."
          className="flex-1 min-h-[44px] px-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={adding}
          className="min-h-[44px] px-4 bg-primary text-primary-foreground text-xs uppercase font-mono font-semibold hover:bg-primary/90 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Table */}
      <div className="border border-border/70 bg-card/50 overflow-hidden">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-border/70 bg-muted/20 text-muted-foreground uppercase text-[0.66rem] tracking-wider">
            <tr>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Subscribed Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((sub) => (
              <tr key={sub.id || sub.email} className="hover:bg-card/80 transition-colors">
                <td className="py-3.5 px-4 font-medium text-foreground flex items-center gap-2">
                  <MailCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{sub.email}</span>
                </td>
                <td className="py-3.5 px-4 text-muted-foreground">
                  {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setDeleteTarget(sub)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Remove Subscriber"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-border/80 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Confirm Unsubscribe
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              Remove <strong className="text-foreground">{deleteTarget.email}</strong> from the Apex journal mailing list?
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
                className="min-h-[44px] px-5 py-2 bg-red-600 text-white text-xs uppercase tracking-wider font-mono font-semibold hover:bg-red-700"
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

