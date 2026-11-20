import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary text-ink-primary flex flex-col items-center justify-center px-6 text-center">
      <span className="font-serif text-3xl font-normal tracking-tight text-ink-primary mb-2">
        coy
      </span>
      <h1 className="font-serif text-xl font-medium text-ink-primary mb-2">
        Page not found
      </h1>
      <p className="text-sm text-ink-secondary mb-6 max-w-xs">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-full bg-ink-primary text-bg-primary text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
      >
        Return to Discover
      </Link>
    </div>
  );
}
