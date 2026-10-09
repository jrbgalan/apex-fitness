import { Suspense } from 'react';
import ResetPassword from '@/views/ResetPassword';

export const metadata = {
  title: 'Reset Password · Apex Fitness Gym',
  description: 'Set a new password for your Apex account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}

