import type { Metadata } from 'next';
import Facilities from '@/views/Facilities';

export const metadata: Metadata = {
  title: 'Facilities & Architecture | Apex Fitness Gym',
  description: 'Six thousand square feet designed around light, air, and focus. Olympic platforms, recovery suites, cold plunge, and private studios in BGC.',
  openGraph: {
    title: 'Facilities & Architecture | Apex Fitness Gym',
    description: 'Six thousand square feet designed around light, air, and focus. Olympic platforms, recovery suites, cold plunge, and private studios in BGC.',
    url: 'https://apexfitness.com/facilities',
    siteName: 'Apex Fitness Gym',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Apex Fitness Gym architectural facilities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facilities & Architecture | Apex Fitness Gym',
    description: 'Six thousand square feet designed around light, air, and focus.',
  },
};

export default function FacilitiesPage() {
  return <Facilities />;
}
