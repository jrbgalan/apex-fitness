'use client';
import { useState } from 'react';
import Link from '@/components/Link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';

const FOOTER_LINKS = [
  {
    title: 'Explore',
    items: [
      { label: 'Classes', to: '/classes' },
      { label: 'Trainers', to: '/trainers' },
      { label: 'Membership', to: '/membership' },
      { label: 'Facilities', to: '/facilities' },
    ],
  },
  {
    title: 'Club',
    items: [
      { label: 'About', to: '/about' },
      { label: 'Book a Tour', to: '/book-tour' },
      { label: 'Home', to: '/' },
    ],
  },
];

const SOCIALS = ['Instagram', 'TikTok', 'YouTube', 'X'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await api.entities.NewsletterSubscribers.create({ email });
      toast.success('Welcome to Apex. Check your inbox for confirmation.');
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="px-6 md:px-12 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand + newsletter */}
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="md:col-span-5"
          >
            <motion.h3 variants={fadeUp} className="font-heading text-3xl md:text-4xl text-foreground leading-tight">
              Join the inner circle.
            </motion.h3>
            <motion.p variants={fadeUp} className="mt-4 text-foreground/60 max-w-[50ch] leading-relaxed">
              Early access to new programs, private events, and members-only briefings. No noise — only signal.
            </motion.p>
            <motion.form variants={fadeUp} onSubmit={subscribe} className="mt-8 flex max-w-md border-b border-border focus-within:border-primary transition-colors">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Email address"
                disabled={loading}
                className="flex-1 bg-transparent py-4 text-foreground placeholder:text-foreground/40 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[0.7rem] uppercase tracking-label text-primary hover:text-foreground transition-colors px-3 disabled:opacity-50 select-none"
              >
                {loading ? 'Joining…' : 'Subscribe'}
              </button>
            </motion.form>
          </motion.div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <p className="text-[0.65rem] uppercase tracking-ultra text-primary mb-6">{col.title}</p>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="group relative inline-flex items-center min-h-[36px] text-sm text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {item.label}
                      <span className="absolute bottom-1 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Socials */}
          <div className="md:col-span-3">
            <p className="text-[0.65rem] uppercase tracking-ultra text-primary mb-6">Follow</p>
            <ul className="space-y-3">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <a
                    href="#"
                    className="group relative inline-flex items-center min-h-[36px] text-sm text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {s}
                    <span className="absolute bottom-1 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-heading text-2xl tracking-[0.2em] text-foreground">APEX</p>
          <p className="text-[0.65rem] uppercase tracking-label text-foreground/40">
            © {new Date().getFullYear()} John Romeo Galan
          </p>
        </div>
      </div>
    </footer>
  );
}