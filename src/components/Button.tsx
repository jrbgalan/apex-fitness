'use client';
import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import Link from '@/components/Link';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';

const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
  ghost: 'border border-border text-foreground hover:border-primary/60 hover:text-primary transition-colors',
  solid: 'bg-foreground text-background transition-colors',
  link: 'text-foreground hover:text-primary transition-colors',
};

const SIZES = {
  md: 'px-8 py-4 text-[0.7rem] min-h-[44px]',
  sm: 'px-6 py-3 text-[0.65rem] min-h-[44px]',
  lg: 'px-10 py-5 text-xs min-h-[48px]',
};

export interface ButtonProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  onClick?: (e?: any) => void;
  variant?: 'primary' | 'ghost' | 'solid' | 'link';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  [key: string]: any;
}

export default function Button({
  children, to, href, onClick, variant = 'primary', size = 'md',
  className, type = 'button', disabled, ...props
}: ButtonProps) {
  const btnRef = useRef<any>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDesktop(window.matchMedia('(pointer: fine)').matches);
    }
  }, []);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const magneticX = useSpring(0, springConfig);
  const magneticY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDesktop || variant !== 'primary' || !btnRef.current || disabled) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.18;
    const distanceY = (e.clientY - centerY) * 0.18;
    magneticX.set(distanceX);
    magneticY.set(distanceY);
  };

  const handleMouseLeave = () => {
    if (variant === 'primary') {
      magneticX.set(0);
      magneticY.set(0);
    }
  };

  const classes = cn(
    'relative inline-flex items-center justify-center gap-2.5 uppercase tracking-label font-medium overflow-hidden select-none',
    VARIANTS[variant], SIZES[size], className
  );

  const inner = (
    <motion.span
      style={isDesktop && variant === 'primary' ? { x: magneticX, y: magneticY } : undefined}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cn('inline-flex items-center justify-center gap-2.5', disabled && 'opacity-50 pointer-events-none')}
    >
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </motion.span>
  );

  if (to) {
    return (
      <Link
        ref={btnRef}
        to={to}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={classes}
        {...props}
      >
        {inner}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        ref={btnRef}
        href={href}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={classes}
        {...props}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {inner}
    </button>
  );
}