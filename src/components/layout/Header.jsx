// src/components/layout/Header.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/Layout.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Logo und Markenname */}
        <div>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoImage}>
              <Image 
                src="/images/logo.png" 
                alt="Pack & Go Logo" 
                fill 
                className="object-contain" 
              />
            </div>
            <span className={styles.logoText}>Pack & Go</span>
          </Link>
        </div>

        {/* Desktop-Navigation */}
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink}>
            Startseite
          </Link>
          <Link href="/how-it-works" className={styles.navLink}>
            Wie es funktioniert
          </Link>
          <Link href="/pricing" className={styles.navLink}>
            Preise
          </Link>
          <Link href="/contact" className={styles.navLink}>
            Kontakt
          </Link>
        </nav>

        {/* Desktop-Benutzer-Menü */}
        <div className={styles.userMenu}>
          {user ? (
            <div className={styles.userMenuContainer}>
              <button className={styles.userMenuButton}>
                <span className={styles.userMenuText}>{user.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.userMenuIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className={styles.userMenuDropdown}>
                <Link href={`/${user.role}`} className={styles.userMenuItem}>
                  Dashboard
                </Link>
                <Link href={`/${user.role}/profile`} className={styles.userMenuItem}>
                  Profil
                </Link>
                <button
                  onClick={logout}
                  className={styles.userMenuItem}
                >
                  Abmelden
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>
                Anmelden
              </Link>
              <Link href="/register" className={styles.btnPrimary}>
                Registrieren
              </Link>
            </>
          )}
        </div>

        {/* Mobile-Menü-Button */}
        <div>
          <button
            onClick={toggleMobileMenu}
            className={styles.mobileMenuButton}
            aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
          >
            <svg
              className={mobileMenuOpen ? "iconHidden" : "iconVisible"}
              xmlns="http://www.w3.org/2000/svg"
              width="24" 
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={mobileMenuOpen ? "iconVisible" : "iconHidden"}
              xmlns="http://www.w3.org/2000/svg"
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile-Menü */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div>
          <Link href="/" className={styles.mobileMenuItem}>
            Startseite
          </Link>
          <Link href="/how-it-works" className={styles.mobileMenuItem}>
            Wie es funktioniert
          </Link>
          <Link href="/pricing" className={styles.mobileMenuItem}>
            Preise
          </Link>
          <Link href="/contact" className={styles.mobileMenuItem}>
            Kontakt
          </Link>
        </div>
        <div className={styles.mobileMenuDivider}>
          {user ? (
            <div>
              <div className={styles.mobileMenuUser}>
                {user.name}
              </div>
              <Link href={`/${user.role}`} className={styles.mobileMenuItem}>
                Dashboard
              </Link>
              <Link href={`/${user.role}/profile`} className={styles.mobileMenuItem}>
                Profil
              </Link>
              <button
                onClick={logout}
                className={styles.mobileMenuItem}
              >
                Abmelden
              </button>
            </div>
          ) : (
            <div>
              <Link href="/login" className={styles.mobileMenuItem}>
                Anmelden
              </Link>
              <Link href="/register" className={styles.mobileMenuItem}>
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