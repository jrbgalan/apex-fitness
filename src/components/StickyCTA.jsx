import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Mobile-only sticky bottom CTA. Appears after the hero, hides near the footer.
export default function StickyCTA({ label = 'Book a Tour', to = '/book-tour' }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShow(y > 600 && y < max - 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 inset-x-0 z-40 md:hidden p-4 bg-background/90 backdrop-blur-md border-t border-border"
        >
          <Link
            to={to}
            className="block w-full text-center bg-primary text-primary-foreground py-4 uppercase tracking-label text-[0.7rem]"
          >
            {label}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}