import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';

export default function NotFound() {
  return (
    <PageTransition>
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center py-32">
        <p className="text-[0.65rem] uppercase tracking-ultra text-primary mb-6">Error 404</p>
        <h1 className="font-heading text-6xl md:text-9xl text-foreground leading-none tracking-tightest">
          Lost the line.
        </h1>
        <p className="mt-6 text-foreground/60 max-w-md">
          This page didn't make the cut. Let's get you back to the floor.
        </p>
        <Link
          to="/"
          className="mt-10 bg-primary text-primary-foreground px-8 py-4 uppercase tracking-label text-[0.7rem] hover:bg-primary/90 transition-colors"
        >
          Back home
        </Link>
      </section>
    </PageTransition>
  );
}