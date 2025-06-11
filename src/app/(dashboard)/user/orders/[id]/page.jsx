"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/UserDashboard.module.css';
import OrderDetails from '@/components/dashboard/OrderDetails';
import { useEffect, useState } from 'react';

export default function UserDashboard() {
  const params = useParams();
  const orderId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (orderId !== undefined) {
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading order data...</p>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className={styles.errorContainer}>
        <h2>Invalid Order ID</h2>
        <p>Unable to find the specified order. Please check the URL or return to homepage.</p>
        <Link href="/" className={styles.homeLink}>
          Return to Homepage
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.errorContainer}>
        <h2>Login Required</h2>
        <p>Please log in to view your orders.</p>
        <Link href="/login" className={styles.loginLink}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.userDashboard}>
      <OrderDetails orderId={orderId} />
    </div>
  );
}