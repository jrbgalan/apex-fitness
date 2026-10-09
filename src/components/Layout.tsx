'use client';
import Header from './Header';
import Footer from './Footer';
import Cursor from './Cursor';
import Loader from './Loader';
import StickyCTA from './StickyCTA';
import CartDrawer from './shop/CartDrawer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Loader />
      <Cursor />
      <Header />
      <CartDrawer />
      <main className="min-h-screen pb-24 md:pb-0 overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}