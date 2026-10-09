import '@/index.css';
import { Providers } from '@/components/Providers';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata = {
  title: 'Apex Fitness Gym',
  description: 'Private Members Club in Manila · Beyond Limits.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>▲</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <Providers>
          <ScrollToTop />
          {children}
          <Toaster />
          <SonnerToaster position="bottom-center" />
        </Providers>
      </body>
    </html>
  );
}

