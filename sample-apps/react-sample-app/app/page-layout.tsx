'use client';
import AppNotifications from './components/AppNotifications';
import { Header } from './components/Header';

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header></Header>
      <div id="scrollContainer" className="max-h-full h-full overflow-auto">
        <div className="w-3/4 py-5 max-h-full h-full min-h-0 m-auto flex flex-col justify-items-start">
          {children}
          <AppNotifications></AppNotifications>
        </div>
      </div>
    </>
  );
};
