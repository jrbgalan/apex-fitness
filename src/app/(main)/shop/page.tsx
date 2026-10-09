import type { Metadata } from 'next';
import Shop from '@/views/Shop';
import { INITIAL_PRODUCTS } from '@/data/mockData';

export const metadata: Metadata = {
  title: 'Pro Shop · Apparel, Supplements & Equipment',
  description: 'Shop signature athletic apparel, certified performance supplements, and club-grade conditioning equipment from Apex Fitness.',
  openGraph: {
    title: 'Pro Shop | Apex Fitness Gym',
    description: 'Shop signature athletic apparel, certified performance supplements, and club-grade conditioning equipment from Apex Fitness.',
  },
};

const shopJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Apex Fitness Pro Shop',
  description: 'Signature athletic apparel, supplements, and club-grade conditioning equipment.',
  itemListElement: INITIAL_PRODUCTS.map((p, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: p.name,
      image: p.image,
      description: p.description,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: p.price,
        availability: (p.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    },
  })),
};

export default function ShopPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopJsonLd) }}
      />
      <Shop />
    </>
  );
}

