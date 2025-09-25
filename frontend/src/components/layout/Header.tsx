'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, clientInfo, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', current: pathname === '/' },
    { name: 'Cronograma', href: '/schedule', current: pathname === '/schedule' },
    { name: 'Créditos', href: '/credits', current: pathname === '/credits' },
    { name: 'Pagos', href: '/payments', current: pathname === '/payments' },
  ];

  return (
    <header className="bg-roda-black text-roda-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-roda-yellow">
                Roda
              </h1>
            </div>
          </div>

          {/* Client Info (when authenticated) */}
          {isAuthenticated && clientInfo && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-roda-white">
                  {clientInfo.nombre}
                </div>
                <div className="text-xs text-roda-gray-300">
                  {clientInfo.tipo_doc} {clientInfo.num_doc}
                </div>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1 border border-roda-gray-600 rounded-md text-sm text-roda-gray-300 hover:text-roda-white hover:border-roda-yellow transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </button>
            </div>
          )}

          {/* Mobile menu button - Solo mostrar cuando esté autenticado y en pantallas pequeñas */}
          {isAuthenticated && (
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-roda-white hover:text-roda-yellow hover:bg-roda-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-roda-yellow"
                aria-expanded="false"
              >
                <span className="sr-only">Abrir menú principal</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Desktop navigation (when not authenticated) */}
          {!isAuthenticated && (
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <span className="text-roda-gray-300 text-sm">
                  Cronograma de Pagos
                </span>
              </div>
            </nav>
          )}
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-roda-dark">
            {isAuthenticated && clientInfo ? (
              <div className="space-y-2">
                {/* Client info */}
                <div className="text-roda-white text-sm px-3 py-2 border-b border-roda-gray-700">
                  <div className="font-medium">{clientInfo.nombre}</div>
                  <div className="text-roda-gray-300 text-xs">
                    {clientInfo.tipo_doc} {clientInfo.num_doc}
                  </div>
                </div>
                
                {/* Navigation links */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`${
                      item.current
                        ? 'bg-roda-yellow text-roda-black'
                        : 'text-roda-gray-300 hover:text-roda-white hover:bg-roda-gray-700'
                    } block px-3 py-2 text-base font-medium rounded-md transition-colors`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Logout button */}
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-roda-gray-300 hover:text-roda-white hover:bg-roda-gray-700 rounded-md transition-colors border-t border-roda-gray-700 mt-2 pt-4"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Salir
                  </div>
                </button>
              </div>
            ) : (
              <div className="text-roda-gray-300 text-sm px-3 py-2">
                Cronograma de Pagos
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
