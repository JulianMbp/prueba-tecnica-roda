'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Pantalla de login - sin sidebar
    return (
      <div className="min-h-screen bg-roda-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // Pantalla autenticada - con sidebar
  return (
    <div className="min-h-screen bg-roda-white flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
