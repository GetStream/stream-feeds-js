import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { UserContextProvider } from './user-context';
import { ErrorContextProvider } from './error-context';
import { AppNotificationsContextProvider } from './app-notifications-context';
import { pageTitle } from './page-title';
import { LayoutSwitcher } from './layout-switcher';

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
  title: pageTitle,
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
        <div className="flex flex-col max-h-full h-full text-gray-800">
          <AppNotificationsContextProvider>
            <ErrorContextProvider>
              <UserContextProvider>
                <LayoutSwitcher>{children}</LayoutSwitcher>
              </UserContextProvider>
            </ErrorContextProvider>
          </AppNotificationsContextProvider>
        </div>
      </body>
    </html>
  );
}
