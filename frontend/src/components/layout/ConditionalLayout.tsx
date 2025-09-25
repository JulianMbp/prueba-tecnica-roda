'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-roda-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roda-yellow mx-auto mb-4"></div>
            <p className="text-roda-gray-600">Cargando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Si está en la página de login, no mostrar sidebar
  if (pathname === '/login') {
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

  // Si no está autenticado y no está en login, mostrar sin sidebar
  if (!isAuthenticated) {
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
