'use client';
import { motion } from 'framer-motion';
import Link from '@/components/Link';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';

const VARIANTS = {
  primary: 'bg-primary text-primary-foreground',
  ghost: 'border border-border text-foreground hover:border-primary/60 hover:text-primary',
  solid: 'bg-foreground text-background',
  link: 'text-foreground hover:text-primary',
};

const SIZES = {
  md: 'px-8 py-4 text-[0.7rem]',
  sm: 'px-6 py-3 text-[0.65rem]',
  lg: 'px-10 py-5 text-xs',
};

export default function Button({
  children, to, href, onClick, variant = 'primary', size = 'md',
  className, type = 'button', disabled, ...props
}) {
  const classes = cn(
    'relative inline-flex items-center justify-center gap-2.5 uppercase tracking-label font-medium overflow-hidden',
    VARIANTS[variant], SIZES[size], className
  );

  const inner = (
    <motion.span
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn('inline-flex items-center justify-center gap-2.5', disabled && 'opacity-50 pointer-events-none')}
    >
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </motion.span>
  );

  if (to) return <Link to={to} onClick={onClick} className={classes} {...props}>{inner}</Link>;
  if (href) return <a href={href} onClick={onClick} className={classes} {...props}>{inner}</a>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...props}>
      {inner}
    </button>
  );
}