'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from '@/components/Link';
import { Menu } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';
import MobileMenu from './MobileMenu';

export const NAV_LINKS = [
  { label: 'Classes', to: '/classes' },
  { label: 'Trainers', to: '/trainers' },
  { label: 'Membership', to: '/membership' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'About', to: '/about' },
];

export default function Header() {
  const { scrollDir, scrolled } = useScrollDirection();
  const [open, setOpen] = useState(false);
  const hidden = scrollDir === 'down' && scrolled && !open;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-colors duration-500',
          scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
        )}
      >
        <div className="flex items-center justify-between px-6 md:px-12 h-20">
          <Link to="/" className="font-heading text-xl tracking-[0.25em] text-foreground" aria-label="Apex Fitness Gym home">
            APEX
          </Link>

          <nav className="hidden md:flex items-center gap-10" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group relative text-[0.7rem] uppercase tracking-label text-foreground/75 hover:text-foreground transition-colors"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-500" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <Link
              to="/book-tour"
              className="hidden md:inline-flex text-[0.7rem] uppercase tracking-label text-primary hover:text-foreground transition-colors"
            >
              Book a Tour
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      </motion.header>
      <MobileMenu open={open} onClose={() => setOpen(false)} links={NAV_LINKS} />
    </>
  );
}