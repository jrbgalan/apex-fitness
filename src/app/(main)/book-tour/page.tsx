import type { Metadata } from 'next';
import BookTour from '@/views/BookTour';

export const metadata: Metadata = {
  title: 'Book a Private Tour | Apex Fitness Gym',
  description: 'Walk the floor, meet our coaches, and experience the facility. Reserve a private walkthrough of Apex Fitness Gym in BGC Manila.',
  openGraph: {
    title: 'Book a Private Tour | Apex Fitness Gym',
    description: 'Walk the floor, meet our coaches, and experience the facility. Reserve a private walkthrough of Apex Fitness Gym in BGC Manila.',
    url: 'https://apexfitness.com/book-tour',
    siteName: 'Apex Fitness Gym',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Book a private tour at Apex Fitness Gym',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Private Tour | Apex Fitness Gym',
    description: 'Walk the floor, meet the coaches, see the standard.',
  },
};

export default function BookTourPage() {
  return <BookTour />;
}
