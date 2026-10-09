import type { Metadata } from 'next';
import LocationDetail from '@/views/LocationDetail';
import { INITIAL_LOCATIONS } from '@/data/mockData';

export async function generateStaticParams() {
  return INITIAL_LOCATIONS.flatMap((loc) => [
    { slug: loc.slug },
    { slug: loc.id },
  ]);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = INITIAL_LOCATIONS.find((l) => l.slug === slug || l.id === slug);
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

export default async function LocationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LocationDetail slug={slug} />;
}

