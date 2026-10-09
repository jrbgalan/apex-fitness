'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import { api } from '@/api/client';
import { INITIAL_LOCATIONS } from '@/data/mockData';
import Link from '@/components/Link';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'Membership Admissions',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please provide your name, email, and message.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await api.entities.ContactInquiries.create({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to submit your inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="pt-36 md:pt-44 pb-32">
        <section className="px-6 md:px-12 max-w-5xl mx-auto text-center">
          <SectionHeading
            label="Inquiries"
            title="Concierge & admissions."
            intro="Connect with our private membership directors, athletic advisors, or media relations team."
            align="center"
            className="mx-auto"
          />
        </section>

        <section className="px-6 md:px-12 max-w-7xl 3xl:max-w-[1700px] 4k:max-w-[2200px] mx-auto mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-card border border-border/80 p-8 sm:p-10">
            <h2 className="font-heading text-2xl text-foreground mb-2">Send an Inquiry</h2>
            <p className="text-xs text-muted-foreground mb-8">
              Inquiries are acknowledged within four business hours by our concierge desk.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-5">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-heading text-2xl text-foreground mb-2">Inquiry Received</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">
                  Thank you, <span className="text-foreground font-medium">{form.name}</span>. A member of our executive concierge team will review your message and reply via {form.email}.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', subject: 'Membership Admissions', message: '' });
                  }}
                  className="px-6 py-2.5 border border-border text-xs uppercase tracking-wider hover:border-primary transition-colors font-medium min-h-[44px]"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Sebastian Sterling"
                      className="w-full px-3.5 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="sterling@apex.club"
                      className="w-full px-3.5 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                    Department / Inquiring Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3.5 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                  >
                    <option value="Membership Admissions">Membership Admissions</option>
                    <option value="Corporate Wellness Programs">Corporate Wellness Programs</option>
                    <option value="Private Coaching & PT">Private Coaching & PT</option>
                    <option value="Media, Press & Brand Partnerships">Media, Press & Brand Partnerships</option>
                    <option value="General Concierge Assistance">General Concierge Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your fitness background, inquiry goals, or desired home club location..."
                    className="w-full px-3.5 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Message...</span>
                    </>
                  ) : (
                    <span>Submit Inquiry</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Info & Club Desks */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border/80 p-8 space-y-6">
              <h3 className="font-heading text-xl text-foreground border-b border-border/60 pb-3">
                Central Concierge
              </h3>
              <div className="space-y-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground">concierge@apexfitness.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground font-mono">+63 (2) 8888-2739</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>Monday — Sunday: 05:00 — 23:00 PHT</span>
                </div>
              </div>
            </div>

            {/* Club Locations List */}
            <div className="bg-card border border-border/80 p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-heading text-xl text-foreground">Club Desks</h3>
                <Link
                  to="/locations"
                  className="text-[0.68rem] uppercase tracking-wider text-primary hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3.5 pt-1">
                {INITIAL_LOCATIONS.slice(0, 3).map((loc) => (
                  <div key={loc.id} className="text-xs">
                    <p className="font-medium text-foreground">{loc.name}</p>
                    <p className="text-muted-foreground line-clamp-1 mt-0.5">{loc.address}</p>
                    <p className="text-primary font-mono text-[0.7rem] mt-0.5">{loc.phone}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tour CTA banner */}
            <div className="p-6 bg-primary/10 border border-primary/30 flex items-center justify-between gap-4">
              <div>
                <p className="font-heading text-base text-foreground">Prefer an in-person walkthrough?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Schedule a 30-minute private tour.</p>
              </div>
              <Link
                to="/book-tour"
                className="shrink-0 px-4 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-colors min-h-[44px] flex items-center"
              >
                Book Tour
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

