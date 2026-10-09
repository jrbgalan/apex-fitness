import type { Metadata } from 'next';
import Membership from '@/views/Membership';

export const metadata: Metadata = {
  title: 'Membership Tiers | Apex Fitness Gym',
  description: 'Three tiers. One philosophy. No hidden fees, no lock-in contracts. Join the private community devoted to serious progress and holistic recovery.',
  openGraph: {
    title: 'Membership Tiers | Apex Fitness Gym',
    description: 'Three tiers. One philosophy. No hidden fees, no lock-in contracts. Join the private community devoted to serious progress and holistic recovery.',
    url: 'https://apexfitness.com/membership',
    siteName: 'Apex Fitness Gym',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Apex Fitness Gym membership access',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Membership Tiers | Apex Fitness Gym',
    description: 'Three tiers. One philosophy. No hidden fees, no lock-in contracts.',
  },
};

export default function MembershipPage() {
  return <Membership />;
}
