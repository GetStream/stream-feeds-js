import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from './components/utility/ErrorBoundary';
import { ClientApp } from './ClientApp';
import { Suspense } from 'react';
import localFont from 'next/font/local';

const materialSymbols = localFont({
  src: '../../../node_modules/material-symbols/material-symbols-outlined.woff2',
  variable: '--font-material-symbols',
  display: 'block',
});

export const metadata: Metadata = {
  title: 'Stream Feeds',
  description: 'Stream Feeds - A modern social feed experience',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`min-h-dvh ${materialSymbols.variable}`}>
      <body className="min-h-dvh overflow-x-hidden bg-base-100 text-base-content antialiased">
        <ErrorBoundary
          fallback={
            <div className="min-h-dvh flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <h1 className="font-display text-2xl font-semibold text-error">Something went wrong</h1>
                <p className="text-base-content/70">Please try reloading the page.</p>
              </div>
            </div>
          }
        >
          <Suspense>
            <ClientApp>{children}</ClientApp>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}
