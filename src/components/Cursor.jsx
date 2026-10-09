import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Custom cursor — desktop (pointer: fine) only. Expands over interactive elements.
export default function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setEnabled(true);
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e) => setHover(!!e.target.closest('a, button, [data-cursor], input, textarea, select'));
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, []);

  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[90] mix-blend-difference hidden md:block"
      animate={{ x: pos.x - (hover ? 14 : 4), y: pos.y - (hover ? 14 : 4) }}
      transition={{ type: 'spring', stiffness: 600, damping: 40, mass: 0.4 }}
    >
      <motion.div
        className="rounded-full bg-primary"
        animate={{ width: hover ? 28 : 8, height: hover ? 28 : 8 }}
        transition={{ duration: 0.25 }}
      />
    </motion.div>
  );
}