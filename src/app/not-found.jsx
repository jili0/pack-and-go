"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <div>
        <div>
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
        <div></div>

        <p>Oops! Looks like you've ventured into uncharted territory.</p>

        <p>
          The page you're looking for might have been moved or doesn't exist.
          But don't worry, we can help you find your way back.
        </p>

        <div>
          <h3>Here's where you might want to go:</h3>
          <ul>
            <li>
              Start planning your move on our <Link href="/">homepage</Link>
            </li>
            <li>
              Check out our service <Link href="/pricing">pricing</Link>
            </li>
            <li>
              Get helpful <Link href="/tips">moving tips</Link> for a smooth
              relocation
            </li>
          </ul>
        </div>

        <div>
          <Link href="/">Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
