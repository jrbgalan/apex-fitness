'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from '@/components/Link';
import { toast } from 'sonner';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

const TIMES = ['07:00', '09:00', '11:00', '14:00', '16:00', '18:00'];
const INTERESTS = ['Strength', 'Yoga', 'HIIT', 'Cycling', 'Boxing', 'Pilates', 'Just exploring'];

export default function BookTour() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', interest: 'Strength',
    preferred_date: '', preferred_time: '09:00', notes: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null }));
    if (submitError) setSubmitError(null);
  };

  const validate0 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please provide your full name.';
    if (!form.email.trim()) {
      e.email = 'Please provide your email address.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      e.email = 'Please provide a valid email address.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate1 = () => {
    const e = {};
    if (!form.preferred_date) e.preferred_date = 'Please select a preferred date for your tour.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && validate0()) setStep(1);
    else if (step === 1 && validate1()) setStep(2);
  };

  const back = () => {
    setSubmitError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setSubmitError(null);
    try {
      await api.entities.TourBookings.create({ ...form, status: 'pending' });
      setDone(true);
      toast.success('Tour request confirmed.');
    } catch (err) {
      const msg = err.message || 'Unable to submit your tour request right now. Please check your network and try again.';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (done) {
    return (
      <PageTransition>
        <section className="min-h-[80vh] flex items-center justify-center px-6 py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-center max-w-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 16 }}
              className="w-16 h-16 mx-auto rounded-full border border-primary/60 bg-primary/10 flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="mt-8 font-heading text-4xl md:text-5xl text-foreground">Tour confirmed.</h2>
            <p className="mt-4 text-foreground/65 leading-relaxed">
              We'll confirm your session at {form.preferred_time} on {form.preferred_date} via {form.email}.
              We look forward to welcoming you to Apex.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center min-h-[44px] border border-border px-8 py-4 uppercase tracking-label text-[0.7rem] text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              Back to Home
            </Link>
          </motion.div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12">
        <SectionHeading
          label="Visit"
          title="Book a private tour."
          intro="One hour, uninterrupted. See the training floor, meet a coach, discuss your standard."
        />
      </section>

      {/* Stepper */}
      <section className="px-6 md:px-12 pb-8">
        <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-ultra">
          {['Details', 'Date & time', 'Confirm'].map((label, i) => (
            <div key={i} className="flex items-center gap-3 min-h-[44px]">
              <span className={cn('flex items-center gap-2', i === step ? 'text-primary' : i < step ? 'text-foreground' : 'text-foreground/35')}>
                <span
                  className={cn(
                    'w-6 h-6 rounded-full border flex items-center justify-center text-[0.6rem] transition-colors',
                    i === step ? 'border-primary text-primary' : i < step ? 'border-primary text-primary bg-primary/10' : 'border-border'
                  )}
                >
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              {i < 2 && <span className="w-6 sm:w-8 h-px bg-border/60" />}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24 max-w-xl">
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Submission error</p>
              <p className="text-xs mt-1 text-destructive/80">{submitError}</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
              <Field label="Full name" error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="input-base text-sm"
                  placeholder="Juan dela Cruz"
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className="input-base text-sm"
                  placeholder="you@email.com"
                />
              </Field>
              <Field label="Phone (optional)">
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className="input-base text-sm"
                  placeholder="+63 917 000 0000"
                />
              </Field>
              <Field label="Primary Discipline">
                <div className="flex flex-wrap gap-2 pt-1">
                  {INTERESTS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => set('interest', o)}
                      className={cn(
                        'min-h-[44px] px-4 py-2 text-xs border transition-colors flex items-center justify-center',
                        form.interest === o ? 'border-primary text-primary bg-primary/5' : 'border-border text-foreground/60 hover:text-foreground hover:border-border/80'
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </Field>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
              <Field label="Preferred date" error={errors.preferred_date}>
                <input
                  type="date"
                  min={today}
                  value={form.preferred_date}
                  onChange={(e) => set('preferred_date', e.target.value)}
                  className="input-base text-sm"
                />
              </Field>
              <Field label="Preferred time">
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('preferred_time', t)}
                      className={cn(
                        'min-h-[44px] py-2.5 text-sm border transition-colors flex items-center justify-center',
                        form.preferred_time === t ? 'border-primary text-primary bg-primary/5' : 'border-border text-foreground/60 hover:text-foreground'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Notes or specific goals (optional)">
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={3}
                  className="input-base text-sm resize-none"
                  placeholder="Any training history, questions, or requirements…"
                />
              </Field>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-2">
              <p className="text-[0.65rem] uppercase tracking-ultra text-primary mb-3">Review Details</p>
              <Review label="Full Name" value={form.name} />
              <Review label="Email" value={form.email} />
              <Review label="Phone" value={form.phone || '—'} />
              <Review label="Focus" value={form.interest} />
              <Review label="Date" value={form.preferred_date} />
              <Review label="Time" value={form.preferred_time} />
              {form.notes && <Review label="Notes" value={form.notes} />}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              disabled={loading}
              className="min-h-[44px] flex items-center text-[0.7rem] uppercase tracking-label text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              className="min-h-[44px] bg-primary text-primary-foreground px-8 py-3.5 uppercase tracking-label text-[0.7rem] font-medium hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="min-h-[44px] bg-primary text-primary-foreground px-8 py-3.5 uppercase tracking-label text-[0.7rem] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Confirming…' : 'Confirm booking'}
            </button>
          )}
        </div>
      </section>
    </PageTransition>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[0.65rem] uppercase tracking-ultra text-foreground/55 mb-2">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Review({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-3 gap-4">
      <span className="text-[0.65rem] uppercase tracking-ultra text-foreground/45 shrink-0">{label}</span>
      <span className="text-foreground text-right text-sm">{value}</span>
    </div>
  );
}