import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ClientApp } from './ClientApp';

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
    <html lang="en">
      <body>
        <ErrorBoundary
          fallback={<div>Something went wrong. Try reloading the page.</div>}
        >
          <ClientApp>{children}</ClientApp>
        </ErrorBoundary>
      </body>
    </html>
  );
}
