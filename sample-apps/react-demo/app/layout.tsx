import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from './components/utility/ErrorBoundary';
import { ClientApp } from './ClientApp';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Stream Feeds React Demo',
  description: 'Stream Feeds React Demo App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="max-h-full h-full">
      <body className="max-h-full h-full">
        <ErrorBoundary
          fallback={<div>Something went wrong. Try reloading the page.</div>}
        >
          <Suspense>
            <ClientApp>{children}</ClientApp>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}
