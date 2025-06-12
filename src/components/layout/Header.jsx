"use client";

import { useState } from "react";

const Header = () => {
  const [user, setUser] = useState(null); // Replace with actual auth logic

  const handleLogout = () => {
    setUser(null);
    // Add logout logic here
  };

  return (
    <header>
      <div className="header-container">
        {/* Logo */}
        <a href="/">
          <img src="/images/logo.png" alt="Pack & Go Logo" />
        </a>

        {/* Desktop Navigation */}
        <nav>
          <a href="/">Home</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#contact">Contact</a>
        </nav>

        {/* User Menu */}
        <div className="user-menu">
          {user ? (
            <div className="auth-links">
              <span>{user.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <a href="/login">Login</a>
              <a href="/register">Register</a>
            </div>
          )}

          {/* Admin Icon */}
          <a
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
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
