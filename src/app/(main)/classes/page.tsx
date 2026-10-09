import type { Metadata } from 'next';
import Classes from '@/views/Classes';

export const metadata: Metadata = {
  title: 'Classes | Training Schedule & Disciplines',
  description: 'Six categories, forty sessions a week. Filter by strength, power, conditioning, mobility, and endurance. Built for serious athletic progression.',
  openGraph: {
    title: 'Classes | Apex Fitness Gym',
    description: 'Six categories, forty sessions a week. Filter by strength, power, conditioning, mobility, and endurance.',
    url: 'https://apexfitness.com/classes',
    siteName: 'Apex Fitness Gym',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Apex Fitness Gym classes and training disciplines',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classes | Apex Fitness Gym',
    description: 'Six categories, forty sessions a week. Filter by what you came to build.',
  },
};

export default function ClassesPage() {
  return <Classes />;
}
