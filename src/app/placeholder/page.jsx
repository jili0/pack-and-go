'use client';

import Link from 'next/link';
import styles from '@/app/styles/Placeholder.module.css';

export default function PlaceholderPage() {
  return (
    <div className={styles.placeholderContainer}>
      <div className={styles.contentBox}>
        <div className={styles.iconContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.infoIcon}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h1 className={styles.title}>Project Scope Notice</h1>
        <div className={styles.divider}></div>
        <p className={styles.description}>
          This page is a placeholder and is not implemented within the current project scope.
        </p>
        <p className={styles.subdescription}>
          Due to time constraints for this final project, only core functionality pages have been developed.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}