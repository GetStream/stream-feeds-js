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
    <html lang="en" className="max-h-full h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-h-full h-full w-full`}
      >
        <div className="flex flex-col max-h-full h-full">
          <UserContextProvider>
            <FeedContextProvider>
              <Header></Header>
              <div className="w-3/4 py-5 max-h-full h-full min-h-0 m-auto flex flex-col justify-items-start">
                {children}
              </div>
            </FeedContextProvider>
          </UserContextProvider>
        </div>
      </body>
    </html>
  );
}
