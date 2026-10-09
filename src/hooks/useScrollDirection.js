'use client';
import { useState, useEffect } from 'react';

// Tracks scroll direction + whether the user has scrolled past a threshold.
export function useScrollDirection(threshold = 40) {
  const [scrollDir, setScrollDir] = useState('up');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > threshold);
        if (Math.abs(y - last) > 8) {
          setScrollDir(y > last && y > 200 ? 'down' : 'up');
          last = y;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return { scrollDir, scrolled };
}