'use client';
import React from 'react';
import Link from '@/components/Link';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="max-w-md w-full p-8 bg-card rounded-xl border border-border text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 mb-6 rounded-full bg-primary/10 text-primary">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl text-foreground mb-3">Access Restricted</h1>
        <p className="text-foreground/70 text-sm mb-6 leading-relaxed">
          Your account is not registered for private club access. Please apply for membership or contact our desk.
        </p>
        <Link
          to="/book-tour"
          className="inline-flex items-center justify-center w-full min-h-[44px] bg-primary text-primary-foreground py-3 text-xs uppercase tracking-label font-medium hover:bg-primary/90 transition-colors"
        >
          Book a Tour
        </Link>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
