"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/styles/AdminDashboard.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsers(usersData.users);
        }
      }

      // Fetch orders
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.orders);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    if (action === 'delete') {
      if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
      }
    }

    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action !== 'delete' ? JSON.stringify({ action }) : undefined,
      });

      const data = await response.json();

      if (data.success) {
        if (action === 'delete') {
          // Remove user from the list
          setUsers(users.filter(user => user._id !== userId));
        } else {
          // Update user in the list
          setUsers(users.map(user => 
            user._id === userId 
              ? { ...user, ...data.user }
              : user
          ));
        }
      } else {
        setError(data.message || `Error performing ${action} action`);
      }
    } catch (error) {
      console.error('Error with user action:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = (userId) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const getFilteredUsers = (role) => {
    let filtered = users.filter(u => u.role === role);
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.slice(0, 5); // Show max 5 items
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      user: {
        class: `${styles.roleBadge} ${styles.roleUser}`,
        text: "Customer",
      },
      company: {
        class: `${styles.roleBadge} ${styles.roleCompany}`,
        text: "Company",
      },
      admin: {
        class: `${styles.roleBadge} ${styles.roleAdmin}`,
        text: "Admin",
      },
    };
    const roleInfo = roleMap[role] || { class: styles.roleBadge, text: role };
    return <span className={roleInfo.class}>{roleInfo.text}</span>;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        class: `${styles.statusBadge} ${styles.statusPending}`,
        text: "Pending",
      },
      confirmed: {
        class: `${styles.statusBadge} ${styles.statusConfirmed}`,
        text: "Confirmed",
      },
      declined: {
        class: `${styles.statusBadge} ${styles.statusDeclined}`,
        text: "Declined",
      },
      completed: {
        class: `${styles.statusBadge} ${styles.statusCompleted}`,
        text: "Completed",
      },
      cancelled: {
        class: `${styles.statusBadge} ${styles.statusCancelled}`,
        text: "Cancelled",
      },
    };
    const statusInfo = statusMap[status] || {
      class: styles.statusBadge,
      text: status,
    };
    return <span className={statusInfo.class}>{statusInfo.text}</span>;
  };

  const getUserStats = () => {
    const customers = users.filter((u) => u.role === "user").length;
    const companies = users.filter((u) => u.role === "company").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total: users.length, customers, companies, admins };
  };

  const getOrderStats = () => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const confirmed = orders.filter((o) => o.status === "confirmed").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return {
      total: orders.length,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue,
    };
  };

  const userStats = getUserStats();
  const orderStats = getOrderStats();
  const recentOrders = orders.slice(0, 5);

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


      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          <div className={styles.errorIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className={styles.errorText}>
            <h3 className={styles.errorTitle}>Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* User Management Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>User & Account Management</h2>
        </div>

        {/* User Statistics */}
        <div className={styles.statsGrid}>
          <Link href="/admin/users?filter=all" className={styles.statCard}>
            <h3 className={styles.statTitle}>Total Users</h3>
            <p className={styles.statValue}>{userStats.total}</p>
            <p className={styles.statDescription}>All registered accounts</p>
          </Link>
          <Link href="/admin/users?filter=user" className={styles.statCard}>
            <h3 className={styles.statTitle}>Customers</h3>
            <p className={styles.statValue}>{userStats.customers}</p>
            <p className={styles.statDescription}>Regular users</p>
          </Link>
          <Link href="/admin/users?filter=company" className={styles.statCard}>
            <h3 className={styles.statTitle}>Companies</h3>
            <p className={styles.statValue}>{userStats.companies}</p>
            <p className={styles.statDescription}>Business accounts</p>
          </Link>
          <Link href="/admin/users?filter=admin" className={styles.statCard}>
            <h3 className={styles.statTitle}>Admins</h3>
            <p className={styles.statValue}>{userStats.admins}</p>
            <p className={styles.statDescription}>Administrator accounts</p>
          </Link>
        </div>

        {/* Search Function */}
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search accounts by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={styles.clearSearch}
              >
                ×
              </button>
            )}
            <button
              onClick={() => {/* Search is live, but this provides visual feedback */}}
              className={styles.searchButton}
            >
              Search
            </button>
          </div>
        </div>

        {/* Manage Customers */}
        <div className={styles.dataSection}>
          <div className={styles.dataSectionHeader}>
            <h3 className={styles.dataTitle}>
              Manage Customers ({getFilteredUsers('user').length})
            </h3>
          </div>
          {getFilteredUsers('user').length === 0 ? (
            <div className={styles.emptyState}>
              <p>{searchTerm ? 'No customers match your search' : 'No customers found'}</p>
            </div>
          ) : (
            <div className={styles.dataTable}>
              {getFilteredUsers('user').map((userData) => (
                <div key={userData._id} className={styles.dataRow}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      <span>{userData.name.charAt(0)}</span>
                    </div>
                    <div className={styles.userDetails}>
                      <h4 className={styles.userName}>{userData.name}</h4>
                      <p className={styles.userEmail}>{userData.email}</p>
                    </div>
                  </div>
                  <div className={styles.userMeta}>
                    <div className={styles.metaInfo}>
                      {getRoleBadge(userData.role)}
                      <span className={styles.dateText}>
                        {formatDate(userData.createdAt)}
                      </span>
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleEditUser(userData._id)}
                        className={styles.editButton}
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserAction(userData._id, 'delete')}
                        className={styles.deleteButton}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manage Companies */}
        <div className={styles.dataSection}>
          <div className={styles.dataSectionHeader}>
            <h3 className={styles.dataTitle}>
              Manage Companies ({getFilteredUsers('company').length})
            </h3>
          </div>
          {getFilteredUsers('company').length === 0 ? (
            <div className={styles.emptyState}>
              <p>{searchTerm ? 'No companies match your search' : 'No companies found'}</p>
            </div>
          ) : (
            <div className={styles.dataTable}>
              {getFilteredUsers('company').map((userData) => (
                <div key={userData._id} className={styles.dataRow}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      <span>{userData.name.charAt(0)}</span>
                    </div>
                    <div className={styles.userDetails}>
                      <h4 className={styles.userName}>{userData.name}</h4>
                      <p className={styles.userEmail}>{userData.email}</p>
                    </div>
                  </div>
                  <div className={styles.userMeta}>
                    <div className={styles.metaInfo}>
                      {getRoleBadge(userData.role)}
                      <span className={styles.dateText}>
                        {formatDate(userData.createdAt)}
                      </span>
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleEditUser(userData._id)}
                        className={styles.editButton}
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserAction(userData._id, 'delete')}
                        className={styles.deleteButton}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manage Admins */}
        <div className={styles.dataSection}>
          <div className={styles.dataSectionHeader}>
            <h3 className={styles.dataTitle}>
              Manage Admins ({getFilteredUsers('admin').length})
            </h3>
          </div>
          {getFilteredUsers('admin').length === 0 ? (
            <div className={styles.emptyState}>
              <p>{searchTerm ? 'No administrators match your search' : 'No administrators found'}</p>
            </div>
          ) : (
            <div className={styles.dataTable}>
              {getFilteredUsers('admin').map((userData) => (
                <div key={userData._id} className={styles.dataRow}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      <span>{userData.name.charAt(0)}</span>
                    </div>
                    <div className={styles.userDetails}>
                      <h4 className={styles.userName}>{userData.name}</h4>
                      <p className={styles.userEmail}>{userData.email}</p>
                    </div>
                  </div>
                  <div className={styles.userMeta}>
                    <div className={styles.metaInfo}>
                      {getRoleBadge(userData.role)}
                      <span className={styles.dateText}>
                        {formatDate(userData.createdAt)}
                      </span>
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleEditUser(userData._id)}
                        className={styles.editButton}
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserAction(userData._id, 'delete')}
                        className={styles.deleteButton}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Management Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Order Management</h2>
          <Link href="/admin/orders" className={styles.viewAllLink}>
            Manage All Orders →
          </Link>
        </div>

        {/* Order Statistics */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Total Orders</h3>
            <p className={styles.statValue}>{orderStats.total}</p>
            <p className={styles.statDescription}>All platform orders</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Pending</h3>
            <p className={styles.statValue}>{orderStats.pending}</p>
            <p className={styles.statDescription}>Awaiting response</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Active</h3>
            <p className={styles.statValue}>{orderStats.confirmed}</p>
            <p className={styles.statDescription}>Confirmed orders</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Completed</h3>
            <p className={styles.statValue}>{orderStats.completed}</p>
            <p className={styles.statDescription}>Finished moves</p>
          </div>
        </div>

        {/* Manage Orders */}
        <div className={styles.dataSection}>
          <h3 className={styles.dataTitle}>Manage Orders</h3>
          {recentOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No orders found</p>
            </div>
          ) : (
            <div className={styles.dataTable}>
              {recentOrders.map((order) => (
                <div key={order._id} className={styles.dataRow}>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>
                        #{order._id.slice(-8)}
                      </span>
                      <span className={styles.orderCustomer}>
                        {order.customerName || "Unknown"}
                      </span>
                    </div>
                    <div className={styles.orderRoute}>
                      <span className={styles.routeFrom}>
                        {order.fromAddress?.city}
                      </span>
                      <span className={styles.routeArrow}>→</span>
                      <span className={styles.routeTo}>
                        {order.toAddress?.city}
                      </span>
                    </div>
                  </div>
                  <div className={styles.orderDetails}>
                    {getStatusBadge(order.status)}
                    <span className={styles.priceValue}>
                      {formatCurrency(order.totalPrice)}
                    </span>
                    <span className={styles.dateText}>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}