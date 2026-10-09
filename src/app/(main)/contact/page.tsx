import type { Metadata } from 'next';
import Contact from '@/views/Contact';

export const metadata: Metadata = {
  title: 'Contact & Concierge Admissions',
  description: 'Connect with the Apex Fitness concierge desk for membership admissions, corporate wellness, and private athletic consultations.',
  openGraph: {
    title: 'Contact | Apex Fitness Gym',
    description: 'Connect with the Apex Fitness concierge desk for membership admissions, corporate wellness, and private athletic consultations.',
  },
};

export default function ContactPage() {
  return <Contact />;
}

