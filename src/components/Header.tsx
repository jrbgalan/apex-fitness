'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from '@/components/Link';
import { Menu, ShoppingBag } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';
import { useCart } from '@/lib/CartContext';
import MobileMenu from './MobileMenu';

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Classes', to: '/classes' },
  { label: 'Trainers', to: '/trainers' },
  { label: 'Membership', to: '/membership' },
  { label: 'Locations', to: '/locations' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const { scrollDir, scrolled } = useScrollDirection();
  const [open, setOpen] = useState(false);
  const { totalItems, setCartOpen, badgeBounce } = useCart();
  const hidden = scrollDir === 'down' && scrolled && !open;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-colors duration-500',
          scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border/80' : 'bg-transparent'
        )}
      >
        <div className="flex items-center justify-between px-6 md:px-10 lg:px-12 h-20 max-w-7xl mx-auto">
          <Link
            to="/"
            className="font-heading text-xl tracking-[0.25em] text-foreground min-h-[44px] flex items-center shrink-0"
            aria-label="Apex Fitness Gym home"
          >
            APEX
          </Link>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-8" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group relative text-[0.68rem] xl:text-[0.72rem] uppercase tracking-label text-foreground/75 hover:text-foreground transition-colors min-h-[44px] flex items-center"
              >
                {l.label}
                <span className="absolute bottom-2 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping bag with ${totalItems} items`}
              className="relative flex items-center justify-center min-h-[44px] min-w-[44px] text-foreground hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={
                    badgeBounce
                      ? { scale: [1, 1.45, 0.9, 1.15, 1], opacity: 1 }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.62rem] font-bold text-primary-foreground font-mono shadow-md"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            <Link
              to="/book-tour"
              className="hidden sm:inline-flex items-center min-h-[44px] px-4 py-2 border border-primary/40 text-[0.68rem] uppercase tracking-label text-primary hover:text-background hover:bg-primary transition-all duration-300 group"
            >
              Book a Tour
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] -mr-2 text-foreground hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Open navigation menu"
              aria-expanded={open}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.header>
      <MobileMenu open={open} onClose={() => setOpen(false)} links={NAV_LINKS} />
    </>
  );
}