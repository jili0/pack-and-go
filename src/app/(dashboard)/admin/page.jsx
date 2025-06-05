'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/AdminDashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    pendingCompanies: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0
  });
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const companiesRes = await fetch('/api/admin/companies/pending');
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setPendingCompanies(companiesData.companies || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
            <p className={styles.welcomeMessage}>
              Welcome back, {user?.name || 'Administrator'}!
            </p>
          </div>
          <div className={styles.headerIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3 className={styles.statTitle}>Users</h3>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{stats.totalUsers}</p>
            <p className={styles.statDescription}>Registered users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 className={styles.statTitle}>Companies</h3>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{stats.totalCompanies}</p>
            <div className={styles.statMeta}>
              {stats.pendingCompanies > 0 && (
                <span className={styles.pendingBadge}>
                  {stats.pendingCompanies} pending
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </div>
            <h3 className={styles.statTitle}>Orders</h3>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{stats.totalOrders}</p>
            <div className={styles.statMeta}>
              <span className={styles.activeBadge}>
                {stats.activeOrders} active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>Quick Access</h2>
        <div className={styles.actionButtons}>
          <Link href="/admin/companies" className={styles.actionButton}>
            <div className={styles.actionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Manage Companies</h3>
              <p className={styles.actionDescription}>Review and verify moving companies</p>
            </div>
          </Link>

          <Link href="/admin/users" className={styles.actionButton}>
            <div className={styles.actionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Manage Users</h3>
              <p className={styles.actionDescription}>View and manage user accounts</p>
            </div>
          </Link>

          <Link href="/admin/orders" className={styles.actionButton}>
            <div className={styles.actionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Manage Orders</h3>
              <p className={styles.actionDescription}>Monitor and manage all orders</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Pending Companies */}
      {pendingCompanies.length > 0 && (
        <div className={styles.pendingSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pending Company Verifications</h2>
            <Link href="/admin/companies?filter=pending" className={styles.viewAllLink}>
              View all →
            </Link>
          </div>
          <div className={styles.pendingList}>
            {pendingCompanies.slice(0, 3).map((company) => (
              <div key={company._id} className={styles.pendingCard}>
                <div className={styles.pendingInfo}>
                  <h3 className={styles.pendingName}>{company.companyName}</h3>
                  <p className={styles.pendingDetails}>
                    {company.city} • Registered on {formatDate(company.createdAt)}
                  </p>
                </div>
                <Link 
                  href={`/admin/companies/${company._id}`} 
                  className={styles.reviewButton}
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className={styles.systemSection}>
        <h2 className={styles.sectionTitle}>System Overview</h2>
        <div className={styles.systemGrid}>
          <div className={styles.systemCard}>
            <div className={styles.systemIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className={styles.systemContent}>
              <h3 className={styles.systemTitle}>Platform Status</h3>
              <p className={styles.systemStatus}>All systems operational</p>
            </div>
          </div>

          <div className={styles.systemCard}>
            <div className={styles.systemIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className={styles.systemContent}>
              <h3 className={styles.systemTitle}>Active Regions</h3>
              <p className={styles.systemStatus}>Germany nationwide</p>
            </div>
          </div>

          <div className={styles.systemCard}>
            <div className={styles.systemIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <div className={styles.systemContent}>
              <h3 className={styles.systemTitle}>Performance</h3>
              <p className={styles.systemStatus}>Optimal response times</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}