import type { Metadata } from 'next';
import Register from '@/views/Register';

export const metadata: Metadata = {
  title: 'Apply for Membership | Apex Fitness Gym',
  description: 'Apply for private membership at Apex Fitness Gym. Create your member account to begin induction.',
  openGraph: {
    title: 'Apply for Membership | Apex Fitness Gym',
    description: 'Apply for private membership at Apex Fitness Gym. Create your member account to begin induction.',
    url: 'https://apexfitness.com/register',
    siteName: 'Apex Fitness Gym',
  },
};

export default function RegisterPage() {
  return <Register />;
}
