import type { Metadata } from 'next';
import OrderConfirmation from '@/views/OrderConfirmation';

export const metadata: Metadata = {
  title: 'Order Confirmation · Apex Pro Shop',
  description: 'Your Apex Fitness Pro Shop order confirmation and dispatch receipt.',
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderConfirmation id={id} />;
}

