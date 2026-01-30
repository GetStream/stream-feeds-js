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
  title: 'Stream Feeds React Demo',
  description: 'Stream Feeds React Demo App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`max-h-full h-full ${materialSymbols.variable}`}>
      <body className="max-h-full h-full overflow-hidden">
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
