import type { Metadata } from 'next';
import Shop from '@/views/Shop';

export const metadata: Metadata = {
  title: 'Pro Shop · Apparel, Supplements & Equipment',
  description: 'Shop signature athletic apparel, certified performance supplements, and club-grade conditioning equipment from Apex Fitness.',
  openGraph: {
    title: 'Pro Shop | Apex Fitness Gym',
    description: 'Shop signature athletic apparel, certified performance supplements, and club-grade conditioning equipment from Apex Fitness.',
  },
};

export default function ShopPage() {
  return <Shop />;
}

