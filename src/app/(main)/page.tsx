import type { Metadata } from 'next';
import Home from '@/views/Home';

export const metadata: Metadata = {
  title: 'Apex Fitness Gym · Manila | Private Members Club',
  description: 'Private Members Club in Manila · Beyond Limits. Experience bespoke strength training, recovery suites, and world-class athletic coaching.',
  openGraph: {
    title: 'Apex Fitness Gym · Manila | Private Members Club',
    description: 'Private Members Club in Manila · Beyond Limits. Experience bespoke strength training, recovery suites, and world-class athletic coaching.',
    url: 'https://apexfitness.com',
    siteName: 'Apex Fitness Gym',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Apex Fitness Gym private members floor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex Fitness Gym · Manila',
    description: 'Private Members Club in Manila · Beyond Limits.',
  },
};

export default function HomePage() {
  return <Home />;
}
