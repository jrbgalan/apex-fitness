import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Admin Suite | Apex Fitness Gym',
  description: 'Private administrative management console for club directors and operations.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#0a0a0a] text-foreground">{children}</div>;
}

