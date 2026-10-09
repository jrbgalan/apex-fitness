import type { Metadata } from 'next';
import LocationDetail from '@/views/LocationDetail';
import { INITIAL_LOCATIONS } from '@/data/mockData';

export async function generateStaticParams() {
  return INITIAL_LOCATIONS.map((loc) => ({
    id: loc.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const location = INITIAL_LOCATIONS.find((l) => l.id === id);
  if (!location) {
    return { title: 'Club Location | Apex Fitness Gym' };
  }
  return {
    title: `${location.name} · Club Sanctuaries`,
    description: `${location.description} Located at ${location.address}.`,
    openGraph: {
      title: `${location.name} | Apex Fitness Gym`,
      description: location.description,
      images: [{ url: location.photo, width: 1200, height: 630 }],
    },
  };
}

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocationDetail id={id} />;
}

