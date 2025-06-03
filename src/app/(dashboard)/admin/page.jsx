'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/UserDashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    pendingCompanies: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
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

      const ordersRes = await fetch('/api/orders?limit=5');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.orders || []);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
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
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
        <p className={styles.welcomeMessage}>
          Welcome back, {user?.name || 'Administrator'}!
        </p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            {/* SVG */}
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Users</h3>
            <p className={styles.statValue}>{stats.totalUsers}</p>
            <p className={styles.statDescription}>Registered users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            {/* SVG */}
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Companies</h3>
            <p className={styles.statValue}>{stats.totalCompanies}</p>
            <p className={styles.statDescription}>
              {stats.pendingCompanies > 0 && (
                <span className={styles.pending}>
                  {stats.pendingCompanies} pending
                </span>
              )}
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            {/* SVG */}
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Orders</h3>
            <p className={styles.statValue}>{stats.totalOrders}</p>
            <p className={styles.statDescription}>
              {stats.activeOrders} active
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            {/* SVG */}
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Revenue</h3>
            <p className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</p>
            <p className={styles.statDescription}>Total revenue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Access</h2>
        <div className={styles.actionButtons}>
          <Link href="/admin/companies" className={styles.actionButton}>
            {/* SVG */}
            Manage Companies
          </Link>
          <Link href="/admin/users" className={styles.actionButton}>
            {/* SVG */}
            Manage Users
          </Link>
          <Link href="/admin/orders" className={styles.actionButton}>
            {/* SVG */}
            View Orders
          </Link>
          <Link href="/admin/reports" className={styles.actionButton}>
            {/* SVG */}
            Generate Reports
          </Link>
        </div>
      </div>

      {/* Pending Companies */}
      {pendingCompanies.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pending Company Verifications</h2>
            <Link href="/admin/companies?filter=pending" className={styles.viewAllLink}>
              View all →
            </Link>
          </div>
          <div className={styles.companyList}>
            {pendingCompanies.slice(0, 3).map((company) => (
              <div key={company._id} className={styles.companyCard}>
                <div className={styles.companyInfo}>
                  <h3 className={styles.companyName}>{company.companyName}</h3>
                  <p className={styles.companyDetails}>
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

      {/* Recent Orders */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/admin/orders" className={styles.viewAllLink}>
            View all →
          </Link>
        </div>
        <div className={styles.ordersList}>
          {recentOrders.length > 0 ? (
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-8)}</td>
                    <td>{order.userId?.name || 'Unknown'}</td>
                    <td>{order.companyId?.companyName || 'Unknown'}</td>
                    <td>{order.fromAddress.city} → {order.toAddress.city}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatCurrency(order.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noData}>No orders available</p>
          )}
        </div>
      </div>
    </div>
  );
}
