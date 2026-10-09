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
  return (
    <NextLink ref={ref} href={destination} {...props}>
      {children}
    </NextLink>
  );
});

Link.displayName = 'Link';
export default Link;
