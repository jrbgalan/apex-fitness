import type { Metadata } from 'next';
import Trainers from '@/views/Trainers';

export const metadata: Metadata = {
  title: 'Coaches & Specialists | Apex Fitness Gym',
  description: 'Six elite coaches. Each devoted to a single discipline: Olympic weightlifting, athletic longevity, functional hypertrophy, and mobility.',
  openGraph: {
    title: 'Coaches & Specialists | Apex Fitness Gym',
    description: 'Six elite coaches. Each devoted to a single discipline: Olympic weightlifting, athletic longevity, functional hypertrophy, and mobility.',
    url: 'https://apexfitness.com/trainers',
    siteName: 'Apex Fitness Gym',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Apex Fitness Gym coaching staff',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coaches & Specialists | Apex Fitness Gym',
    description: 'Six specialists. Each devoted to a single discipline. No generalists.',
  },
};

export default function TrainersPage() {
  return <Trainers />;
}
