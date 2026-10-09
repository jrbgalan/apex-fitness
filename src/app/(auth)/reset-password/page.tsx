import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPassword from '@/views/ResetPassword';

export const metadata: Metadata = {
  title: 'Set New Password | Apex Fitness Gym',
  description: 'Enter your new secure password for your Apex Fitness Gym account.',
  openGraph: {
    title: 'Set New Password | Apex Fitness Gym',
    description: 'Enter your new secure password for your Apex Fitness Gym account.',
    url: 'https://apexfitness.com/reset-password',
    siteName: 'Apex Fitness Gym',
  },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
