// src/components/layout/Header.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo und Markenname */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 relative">
                <Image 
                  src="/images/logo.png" 
                  alt="Pack & Go Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <span className="ml-2 text-2xl font-bold text-blue-900">Pack & Go</span>
            </Link>
          </div>

          {/* Desktop-Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">
              Startseite
            </Link>
            <Link href="/wie-es-funktioniert" className="text-gray-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">
              Wie es funktioniert
            </Link>
            <Link href="/preise" className="text-gray-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">
              Preise
            </Link>
            <Link href="/kontakt" className="text-gray-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">
              Kontakt
            </Link>
          </nav>

          {/* Desktop-Benutzer-Menü */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-700 focus:outline-none">
                  <span className="mr-2">{user.name}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link href={`/${user.role}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Dashboard
                  </Link>
                  <Link href={`/${user.role}/profile`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profil
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Abmelden
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">
                  Anmelden
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Registrieren
                </Link>
              </>
            )}
          </div>

          {/* Mobile-Menü-Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-Menü */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50">
            Startseite
          </Link>
          <Link href="/wie-es-funktioniert" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50">
            Wie es funktioniert
          </Link>
          <Link href="/preise" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50">
            Preise
          </Link>
          <Link href="/kontakt" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50">
            Kontakt
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <div className="px-2 space-y-1">
              <div className="px-3 py-2 text-base font-medium text-gray-800">
                {user.name}
              </div>
              <Link href={`/${user.role}`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50">
                Dashboard
              </Link>
              <Link href={`/${user.role}/profile`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50">
                Profil
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50"
              >
                Abmelden
              </button>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50">
                Anmelden
              </Link>
              <Link href="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50">
                Registrieren
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;