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
        
        <h1 className={styles.title}>Coming Soon!</h1>
        <div className={styles.divider}></div>
        
        <p className={styles.description}>
          You've discovered a feature we're still working on!
        </p>
        
        <p className={styles.subdescription}>
          As part of our final project for Pack & Go, we've focused on building the core functionality first. 
          This section is planned for future development.
        </p>
        
        <div className={styles.featureBox}>
          <h3 className={styles.featureTitle}>What to check out instead:</h3>
          <ul className={styles.featureList}>
            <li>Create a move request on our <Link href="/" className={styles.inlineLink}>homepage</Link></li>
            <li>Learn more about our pricing on the <Link href="/pricing" className={styles.inlineLink}>pricing page</Link></li>
            <li>Get helpful moving tips in our <Link href="/tips" className={styles.inlineLink}>moving guide</Link></li>
          </ul>
        </div>
        
        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}