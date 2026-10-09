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

const TIMES = ['07:00', '09:00', '11:00', '14:00', '16:00', '18:00'];
const INTERESTS = ['Strength', 'Yoga', 'HIIT', 'Cycling', 'Boxing', 'Pilates', 'Just exploring'];

export default function BookTour() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', interest: 'Strength',
    preferred_date: '', preferred_time: '09:00', notes: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null }));
  };

  const validate0 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const validate1 = () => {
    const e = {};
    if (!form.preferred_date) e.preferred_date = 'Pick a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && validate0()) setStep(1);
    else if (step === 1 && validate1()) setStep(2);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setLoading(true);
    try {
      await api.entities.TourBooking.create({ ...form, status: 'pending' });
      setDone(true);
    } catch {
      toast.error('Something went wrong. Try again.');
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-center max-w-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
              className="w-16 h-16 mx-auto rounded-full border-2 border-primary flex items-center justify-center"
            >
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="mt-8 font-heading text-4xl md:text-5xl text-foreground">Booked.</h2>
            <p className="mt-4 text-foreground/60 leading-relaxed">
              We'll confirm your tour at {form.preferred_time} on {form.preferred_date} by email.
              We're looking forward to showing you the floor.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex border border-border px-8 py-4 uppercase tracking-label text-[0.7rem] text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              Back home
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
          intro="One hour, no pressure. See the space, meet a coach, ask everything."
        />
      </section>

      {/* Stepper */}
      <section className="px-6 md:px-12 pb-8">
        <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-label">
          {['Details', 'Date & time', 'Confirm'].map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={cn('flex items-center gap-2', i === step ? 'text-primary' : i < step ? 'text-foreground' : 'text-foreground/35')}>
                <span
                  className={cn(
                    'w-6 h-6 rounded-full border flex items-center justify-center text-[0.6rem]',
                    i === step ? 'border-primary text-primary' : i < step ? 'border-primary text-primary bg-primary/10' : 'border-border'
                  )}
                >
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              {i < 2 && <span className="w-6 sm:w-8 h-px bg-border" />}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24 max-w-xl">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: EASE }} className="space-y-6">
              <Field label="Full name" error={errors.name}>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-base" placeholder="Juan dela Cruz" />
              </Field>
              <Field label="Email" error={errors.email}>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input-base" placeholder="you@email.com" />
              </Field>
              <Field label="Phone (optional)">
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-base" placeholder="+63 917 000 0000" />
              </Field>
              <Field label="What are you here for?">
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((o) => (
                    <button
                      key={o}
                      onClick={() => set('interest', o)}
                      className={cn('px-4 py-2.5 text-xs border transition-colors', form.interest === o ? 'border-primary text-primary' : 'border-border text-foreground/60 hover:text-foreground')}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </Field>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: EASE }} className="space-y-6">
              <Field label="Preferred date" error={errors.preferred_date}>
                <input type="date" min={today} value={form.preferred_date} onChange={(e) => set('preferred_date', e.target.value)} className="input-base" />
              </Field>
              <Field label="Preferred time">
                <div className="grid grid-cols-3 gap-2">
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => set('preferred_time', t)}
                      className={cn('py-3 text-sm border transition-colors', form.preferred_time === t ? 'border-primary text-primary' : 'border-border text-foreground/60 hover:text-foreground')}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Anything else? (optional)">
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className="input-base resize-none" placeholder="Goals, questions, accessibility needs…" />
              </Field>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: EASE }} className="space-y-3">
              <p className="text-[0.65rem] uppercase tracking-label text-primary mb-2">Review</p>
              <Review label="Name" value={form.name} />
              <Review label="Email" value={form.email} />
              <Review label="Phone" value={form.phone || '—'} />
              <Review label="Interest" value={form.interest} />
              <Review label="Date" value={form.preferred_date} />
              <Review label="Time" value={form.preferred_time} />
              {form.notes && <Review label="Notes" value={form.notes} />}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <button onClick={back} className="text-[0.7rem] uppercase tracking-label text-foreground/60 hover:text-foreground transition-colors">
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button
              onClick={next}
              className="bg-primary text-primary-foreground px-8 py-4 uppercase tracking-label text-[0.7rem] hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="bg-primary text-primary-foreground px-8 py-4 uppercase tracking-label text-[0.7rem] hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Booking' : 'Confirm booking'}
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
      <label className="block text-[0.65rem] uppercase tracking-label text-foreground/55 mb-2">{label}</label>
      {children}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Review({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border py-3 gap-4">
      <span className="text-[0.65rem] uppercase tracking-label text-foreground/45 shrink-0">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}