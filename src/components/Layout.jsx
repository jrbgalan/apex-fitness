'use client';
import Header from './Header';
import Footer from './Footer';
import Cursor from './Cursor';
import Loader from './Loader';
import StickyCTA from './StickyCTA';

export default function Layout({ children }) {
  return (
    <>
      <Loader />
      <Cursor />
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}