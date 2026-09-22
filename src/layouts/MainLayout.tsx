import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface MainLayoutProps {
  watchlistCount: number;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ watchlistCount, children }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F5F7] flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar watchlistCount={watchlistCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
