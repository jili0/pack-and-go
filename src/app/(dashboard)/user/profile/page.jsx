// src/app/user/profile/page.jsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProfileForm from '@/components/dashboard/ProfileForm';
import styles from '@/app/styles/UserProfile.module.css';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  // (useEffect will handle redirect)
  if (!user) {
    return null;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>Profile Settings</h1>
        <p className={styles.pageDescription}>
          Manage your account information and settings
        </p>
      </div>
      
      <div className={styles.pageContent}>
        <ProfileForm />
      </div>
    </div>
  );
}