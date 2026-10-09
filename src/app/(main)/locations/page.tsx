import type { Metadata } from 'next';
import Locations from '@/views/Locations';

export const metadata: Metadata = {
  title: 'Club Locations · Metro Manila Sanctuaries',
  description: 'Explore Apex Fitness club locations in BGC, Makati, Ortigas, Alabang, and Quezon City. World-class equipment, recovery suites, and private training.',
  openGraph: {
    title: 'Locations | Apex Fitness Gym',
    description: 'Explore Apex Fitness club locations in BGC, Makati, Ortigas, Alabang, and Quezon City. World-class equipment, recovery suites, and private training.',
  },
};

export default function LocationsPage() {
  return <Locations />;
}

