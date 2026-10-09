'use client';
import NextLink from 'next/link';

export function Link({ to, href, children, ...props }) {
  const destination = href || to || '/';
  return (
    <NextLink href={destination} {...props}>
      {children}
    </NextLink>
  );
}

export default Link;

