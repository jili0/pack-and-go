"use client";

import Link from "next/link";

export default function PlaceholderPage() {
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
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <h1>Coming Soon!</h1>
        <div></div>

        <p>You've discovered a feature we're still working on!</p>

        <p>
          As part of our final project for Pack & Go, we've focused on building
          the core functionality first. This section is planned for future
          development.
        </p>

        <div>
          <h3>What to check out instead:</h3>
          <ul>
            <li>
              Create a move request on our <Link href="/">homepage</Link>
            </li>
            <li>
              Learn more about our pricing on the{" "}
              <Link href="/pricing">pricing page</Link>
            </li>
            <li>
              Get helpful moving tips in our{" "}
              <Link href="/tips">moving guide</Link>
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
