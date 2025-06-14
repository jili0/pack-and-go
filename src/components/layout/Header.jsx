'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/Layout.module.css';

const Header = () => {
  const { user, logout } = useAuth();

  // console.log('Current user:', user);
  // console.log('User role:', user?.role);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout(); // AuthContext handles redirection
  };

  return (
    <header className={styles.header}>
      {/* Logo */}
      <Link href="/">
        <Image
          className={styles.logoImage}
          src="/images/logo.png"
          alt="Pack & Go Logo"
          width={225}
          height={100}
        />
      </Link>

      {/* Desktop Navigation */}
      <div className={styles.headerContent}>
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/guide" className={styles.navLink}>Guide</Link>
          <Link href="/pricing" className={styles.navLink}>Pricing</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
          <Link href="/tips" className={styles.navLink}>Tips</Link>
        </nav>

        {/* User Menu (Desktop) */}
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
                <Link href={`/${user.role}`} className={styles.userMenuItem}>Dashboard</Link>
                <Link href={`/${user.role}/profile`} className={styles.userMenuItem}>Profile</Link>
                <button onClick={handleLogout} className={styles.userMenuItem}>Logout</button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>Login</Link>
              <Link href="/register" className={styles.navLink}>Register</Link>
            </>
          )}
          
          {/* Admin Icon Button - Always visible */}
          <Link href="/admin/login" className={styles.adminIconButton} aria-label="Admin Login">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className={styles.mobileMenuButton}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <svg className={styles.closeIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className={styles.menuIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" className={styles.mobileMenuItem}>Home</Link>
          <Link href="/guide" className={styles.mobileMenuItem}>Guide</Link>
          <Link href="/pricing" className={styles.mobileMenuItem}>Pricing</Link>
          <Link href="/contact" className={styles.mobileMenuItem}>Contact</Link>
          <Link href="/tips" className={styles.mobileMenuItem}>Tips</Link>

          <div className={styles.mobileMenuDivider}>
           {user ? (
             <>
               <div className={styles.mobileMenuUser}>{user.name}</div>
               <Link href={`/${user.role}`} className={styles.mobileMenuItem}>Dashboard</Link>
               <Link href={`/${user.role}/profile`} className={styles.mobileMenuItem}>Profile</Link>
               <button onClick={handleLogout} className={styles.mobileMenuItem}>Logout</button>
             </>
           ) : (
             <>
               <Link href="/login" className={styles.mobileMenuItem}>Login</Link>
               <Link href="/register" className={styles.mobileMenuItem}>Register</Link>
             </>
           )}
           {/* Admin Link for Mobile - Always visible */}
           <Link href="/admin/login" className={styles.mobileMenuItem}>Admin Login</Link>
         </div>
       </div>
     )}
   </header>
 );
};

export default Header;