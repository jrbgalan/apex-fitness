'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from '@/components/Link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';

// Mobile-only sticky bottom CTA. Appears after scrolling past the hero, hides near footer and on the tour page itself.
export default function StickyCTA({ label = 'Book a Tour', to = '/book-tour' }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setFooterVisible(entry.isIntersecting);
      },
      { rootMargin: '0px 0px 80px 0px', threshold: 0 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/book-tour') {
      setShow(false);
      return;
    }

    const onScroll = () => {
      const y = window.scrollY;
      setShow(y > 500 && !footerVisible);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname, footerVisible]);

  if (pathname === '/book-tour') return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed bottom-0 inset-x-0 z-40 md:hidden p-4 bg-background/95 backdrop-blur-md border-t border-border"
        >
          <Link
            to={to}
            className="flex items-center justify-center w-full min-h-[44px] bg-primary text-primary-foreground py-3.5 px-6 uppercase tracking-label text-[0.7rem] font-medium hover:bg-primary/90 transition-colors"
          >
            {label}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}