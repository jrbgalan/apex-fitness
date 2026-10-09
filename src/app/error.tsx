'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to client monitoring if configured
    console.error('Handled application exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080808] text-foreground flex items-center justify-center px-6 py-24 select-none">
      <div className="max-w-md w-full border border-border/80 bg-[#0e0e0e]/90 p-8 sm:p-10 rounded-2xl shadow-2xl text-center relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-6">
          <AlertCircle className="w-7 h-7" />
        </div>

        <p className="text-[0.65rem] uppercase tracking-widest text-primary font-mono mb-2">
          Sanctuary Interrupted
        </p>
        <h1 className="font-heading text-2xl sm:text-3xl font-light text-foreground mb-3">
          Temporary Disruption
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-8">
          An unexpected variance occurred during page processing. Our systems have logged this event. You may safely retry the action or return to the main club floor.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-all cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs uppercase tracking-wider font-semibold transition-all min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error?.message && (
          <details className="mt-6 text-left border-t border-border/40 pt-4 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-mono text-[0.65rem] text-primary/80 uppercase">
              Developer Diagnostics
            </summary>
            <pre className="mt-2 p-3 bg-black/60 rounded border border-border/40 text-[0.65rem] text-red-300 font-mono overflow-auto max-h-40 whitespace-pre-wrap">
              {error.message}
              {error.digest ? `\nDigest: ${error.digest}` : ''}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

