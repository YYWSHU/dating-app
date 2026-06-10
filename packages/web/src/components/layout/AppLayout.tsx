import React from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area */}
      <main className={hideNav ? '' : 'pb-20'}>
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom navigation */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
