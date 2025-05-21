'use client';

import Link from 'next/link';
import styles from './styles/NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.contentBox}>
        <h1 className={styles.errorCode}>404</h1>
        <div className={styles.divider}></div>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.description}>
          We couldn't find the page you're looking for.
        </p>
        <p className={styles.subdescription}>
          The page may have been moved, deleted, or the URL might be incorrect.
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