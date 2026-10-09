import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Cursor from './Cursor';
import Loader from './Loader';
import StickyCTA from './StickyCTA';

export default function Layout() {
  return (
    <>
      <Loader />
      <Cursor />
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}