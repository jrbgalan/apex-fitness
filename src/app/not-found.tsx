import type { Metadata } from 'next';
import NotFound from '@/views/NotFound';

export const metadata: Metadata = {
  title: 'Page Not Found | Apex Fitness Gym',
  description: 'The requested page could not be found. Return to Apex Fitness Gym.',
};

export default function NotFoundPage() {
  return <NotFound />;
}
