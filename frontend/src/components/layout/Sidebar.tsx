'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  current: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      current: pathname === '/',
    },
    {
      name: 'Cronograma',
      href: '/schedule',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      current: pathname === '/schedule',
    },
    {
      name: 'Créditos',
      href: '/credits',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      current: pathname === '/credits',
    },
    {
      name: 'Pagos',
      href: '/payments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      current: pathname === '/payments',
    },
  ];

  return (
    <div className={`bg-roda-white border-r border-roda-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-12 lg:w-16' : 'w-48 lg:w-64'
    } flex-shrink-0 flex-col hidden md:flex`}>
      {/* Toggle button - Solo en desktop */}
      <div className="p-2 lg:p-4 border-b border-roda-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full p-2 text-roda-gray-600 hover:text-roda-black hover:bg-roda-gray-50 rounded-md transition-colors"
        >
          <svg
            className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {!isCollapsed && (
            <span className="ml-2 text-xs lg:text-sm font-medium hidden lg:block">Colapsar</span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-2 lg:mt-4 px-1 lg:px-2 flex-1">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`${
                  item.current
                    ? 'bg-roda-yellow text-roda-black'
                    : 'text-roda-gray-700 hover:text-roda-black hover:bg-roda-gray-50'
                } group flex items-center px-1 lg:px-2 py-2 text-xs lg:text-sm font-medium rounded-md transition-colors`}
              >
                <span className={`flex-shrink-0 ${item.current ? 'text-roda-black' : 'text-roda-gray-500'}`}>
                  <div className="w-4 h-4 lg:w-5 lg:h-5">
                    {item.icon}
                  </div>
                </span>
                {!isCollapsed && (
                  <span className="ml-1 lg:ml-3 truncate">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
