import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { EASE } from '@/lib/motion';

// Full-screen slide-in menu with staggered link animation.
export default function MobileMenu({ open, onClose, links }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-0 z-[60] bg-background flex flex-col md:hidden"
        >
          <div className="flex items-center justify-between px-6 h-20">
            <span className="font-heading text-xl tracking-[0.25em]">APEX</span>
            <button onClick={onClose} aria-label="Close menu" className="p-2 -mr-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col px-6 mt-12" aria-label="Mobile">
            {links.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: EASE }}
              >
                <Link
                  to={l.to}
                  onClick={onClose}
                  className="block py-5 font-heading text-4xl text-foreground border-b border-border"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="mt-auto p-6">
            <Link
              to="/book-tour"
              onClick={onClose}
              className="block w-full text-center bg-primary text-primary-foreground py-4 uppercase tracking-label text-[0.7rem]"
            >
              Book a Tour
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}