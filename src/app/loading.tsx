import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-background px-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <span className="absolute font-heading text-xs text-primary font-semibold select-none">
          ▲
        </span>
      </div>
      <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-mono animate-pulse">
        Preparing Experience...
      </p>
    </div>
  );
}
