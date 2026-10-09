'use client';
import React, { forwardRef } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps | 'href'> {
  to?: string;
  href?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, href, children, ...props }, ref) => {
  const destination = href || to || '/';
  const isExternal =
    typeof destination === 'string' &&
    (destination.startsWith('http://') ||
      destination.startsWith('https://') ||
      destination.startsWith('mailto:') ||
      destination.startsWith('tel:'));

  if (isExternal) {
    return (
      <a ref={ref} href={destination} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <NextLink ref={ref} href={destination} {...props}>
      {children}
    </NextLink>
  );
});

Link.displayName = 'Link';
export default Link;
