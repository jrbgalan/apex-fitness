import type { Metadata } from 'next';
import Checkout from '@/views/Checkout';

export const metadata: Metadata = {
  title: 'Checkout · Secure Order Processing',
  description: 'Complete your Apex Pro Shop order with insured courier delivery and member privileges.',
};

export default function CheckoutPage() {
  return <Checkout />;
}

