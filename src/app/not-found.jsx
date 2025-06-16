"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container">
        <div className="not-found-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </div>

        <h1>Page Not Found</h1>
        <p>Oops! Looks like you've ventured into uncharted territory.</p>
        <p>
          The page you're looking for might have been moved or doesn't exist.
          But don't worry, we can help you find your way back.
        </p>

        <Link href="/" className="btn-primary">
          Back to Homepage
        </Link>
      </div>
    </section>
  );
}
