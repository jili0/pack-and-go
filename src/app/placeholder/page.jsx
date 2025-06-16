"use client";

import Link from "next/link";
import "@/app/styles/styles.css";

export default function PlaceholderPage() {
  return (
    <section className="container">
      <div className="placeholder-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>

      <h1>Coming Soon!</h1>
      <p>You've discovered a feature we're still working on!</p>
      <p>
        As part of our final project for Pack & Go, we've focused on building
        the core functionality first. This section is planned for future
        development.
      </p>

      <Link href="/" className="btn-primary">
        Back to Homepage
      </Link>
    </section>
  );
}
