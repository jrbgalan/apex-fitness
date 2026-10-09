import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import '@/index.css';
import { Providers } from '@/components/Providers';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-serif',
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://apexfitness.com'),
  title: {
    default: 'Apex Fitness Gym · Manila',
    template: '%s | Apex Fitness Gym',
  },
  description: 'Private Members Club in Manila · Beyond Limits.',
  keywords: ['fitness', 'gym', 'private members club', 'manila', 'strength training', 'recovery', 'wellness'],
  authors: [{ name: 'John Romeo Galan' }],
  creator: 'John Romeo Galan',
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: 'https://apexfitness.com',
    siteName: 'Apex Fitness Gym',
    title: 'Apex Fitness Gym · Beyond Limits',
    description: 'Private Members Club in Manila · Beyond Limits.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Apex Fitness Gym interior',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex Fitness Gym · Manila',
    description: 'Private Members Club in Manila · Beyond Limits.',
    images: ['https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop'],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>▲</text></svg>",
    apple: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230a0a0a'/><text y='.78em' x='50%' text-anchor='middle' font-size='65' fill='%23d4af37'>▲</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground font-body">
        <Providers>
          <ScrollToTop />
          {children}
          <Toaster />
          <SonnerToaster position="bottom-center" />
        </Providers>
      </body>
    </html>
  );
}
