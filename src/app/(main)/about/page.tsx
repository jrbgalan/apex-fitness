import type { Metadata } from 'next';
import About from '@/views/About';

export const metadata: Metadata = {
  title: 'About | The Philosophy of Apex Fitness Gym',
  description: 'What if a gym held you to a standard, instead of selling you a membership? Learn about the principles, discipline, and origins of Apex Fitness Gym.',
  openGraph: {
    title: 'About | The Philosophy of Apex Fitness Gym',
    description: 'What if a gym held you to a standard, instead of selling you a membership? Learn about the principles, discipline, and origins of Apex Fitness Gym.',
    url: 'https://apexfitness.com/about',
    siteName: 'Apex Fitness Gym',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Apex Fitness philosophy and training space',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Apex Fitness Gym',
    description: 'What if a gym held you to a standard, instead of selling you a membership?',
  },
};

export default function AboutPage() {
  return <About />;
}
