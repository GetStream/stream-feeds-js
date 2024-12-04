import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { UserContextProvider } from './user-context';
import { Header } from './components/Header';
import { FeedContextProvider } from './feed-context';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Stream Facebook Clone',
  description: 'Showcases Feeds v3 API',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserContextProvider>
          <FeedContextProvider>
            <Header></Header>
            {children}
          </FeedContextProvider>
        </UserContextProvider>
      </body>
    </html>
  );
}
