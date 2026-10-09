import type { Metadata } from 'next';
import ForgotPassword from '@/views/ForgotPassword';

export const metadata: Metadata = {
  title: 'Forgot Password | Apex Fitness Gym',
  description: 'Reset your Apex Fitness Gym account credentials securely.',
  openGraph: {
    title: 'Forgot Password | Apex Fitness Gym',
    description: 'Reset your Apex Fitness Gym account credentials securely.',
    url: 'https://apexfitness.com/forgot-password',
    siteName: 'Apex Fitness Gym',
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
