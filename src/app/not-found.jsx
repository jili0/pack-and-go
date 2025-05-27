'use client';

import Link from 'next/link';
import styles from '@/app/styles/NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
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
            className={styles.compassIcon}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </div>
        
        <h1 className={styles.title}>Page Not Found</h1>
        <div className={styles.divider}></div>
        
        <p className={styles.description}>
          Oops! Looks like you've ventured into uncharted territory.
        </p>
        
        <p className={styles.subdescription}>
          The page you're looking for might have been moved or doesn't exist. 
          But don't worry, we can help you find your way back.
        </p>
        
        <div className={styles.featureBox}>
          <h3 className={styles.featureTitle}>Here's where you might want to go:</h3>
          <ul className={styles.featureList}>
            <li>Start planning your move on our <Link href="/" className={styles.inlineLink}>homepage</Link></li>
            <li>Check out our service <Link href="/pricing" className={styles.inlineLink}>pricing</Link></li>
            <li>Get helpful <Link href="/tips" className={styles.inlineLink}>moving tips</Link> for a smooth relocation</li>
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