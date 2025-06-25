"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { user, account, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Use account if user is undefined (fallback)
  const currentUser = user || account;

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  return (
    <header>
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="header-logo">
          <img src="/images/logo.png" alt="Pack & Go Logo" />
        </Link>

        {/* Desktop Navigation */}
        <nav>
          <Link href="/">Home</Link>
          <Link href="/#pricing" className="mobile-hide">
            Pricing
          </Link>
          <Link href="/#companies" className="mobile-hide">
            Companies
          </Link>
          <Link href="/#contact" className="mobile-hide">
            Contact
          </Link>

          {/* Account Menu */}
          {currentUser ? (
            <div className="user-dropdown">
              <button
                className="btn-secondary"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {currentUser.name}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link
                     href={currentUser.role === "user" ? "/account" : "/company"}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button className="btn-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}

          {/* Admin Icon */}
          <Link
            href="/admin/login"
            className="admin-icon"
            aria-label="Admin Login"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
