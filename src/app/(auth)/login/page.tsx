import type { Metadata } from 'next';
import Login from '@/views/Login';

export const metadata: Metadata = {
  title: 'Member Login | Apex Fitness Gym',
  description: 'Sign in to your Apex Fitness Gym account to manage bookings, track workouts, and view club events.',
  openGraph: {
    title: 'Member Login | Apex Fitness Gym',
    description: 'Sign in to your Apex Fitness Gym account to manage bookings, track workouts, and view club events.',
    url: 'https://apexfitness.com/login',
    siteName: 'Apex Fitness Gym',
  },
};

export default function LoginPage() {
  return <Login />;
}
