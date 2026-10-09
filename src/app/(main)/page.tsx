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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['HealthClub', 'SportsActivityLocation', 'Organization'],
  name: 'Apex Fitness Gym',
  alternateName: 'Apex Fitness Club',
  url: 'https://apexfitness.com',
  logo: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600',
  image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200',
  description:
    'Private Members Club in Manila · Beyond Limits. Experience bespoke strength training, recovery suites, and world-class athletic coaching.',
  priceRange: '$$$$',
  telephone: '+63-2-8888-2739',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Level 4, High Street South Corporate Plaza Tower 1, 26th St',
    addressLocality: 'Bonifacio Global City, Taguig',
    addressRegion: 'Metro Manila',
    postalCode: '1634',
    addressCountry: 'PH',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 14.5505,
    longitude: 121.0509,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '05:00',
      closes: '23:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '06:00',
      closes: '22:00',
    },
  ],
  sameAs: [
    'https://instagram.com/apexfitness',
    'https://facebook.com/apexfitness',
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Home />
    </>
  );
}
