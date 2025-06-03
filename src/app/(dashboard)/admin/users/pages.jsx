'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/AdminUsers.module.css';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on role and search
  useEffect(() => {
    let filtered = users;

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Error loading users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        // Update user in the list
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, ...data.user }
            : user
        ));
        
        // Close modal if open
        if (showModal) {
          setShowModal(false);
          setSelectedUser(null);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      user: { class: `${styles.roleBadge} ${styles.roleUser}`, text: 'Customer' },
      company: { class: `${styles.roleBadge} ${styles.roleCompany}`, text: 'Company' },
      admin: { class: `${styles.roleBadge} ${styles.roleAdmin}`, text: 'Admin' }
    };
    
    const roleInfo = roleMap[role] || { class: styles.roleBadge, text: role };
    
    return (
      <span className={roleInfo.class}>
        {roleInfo.text}
      </span>
    );
  };

  const getStats = () => {
    const customers = users.filter(u => u.role === 'user').length;
    const companies = users.filter(u => u.role === 'company').length;
    const admins = users.filter(u => u.role === 'admin').length;

    return { total: users.length, customers, companies, admins };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.usersContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>User Management</h1>
            <p className={styles.pageDescription}>
              Manage all registered users and their accounts
            </p>
          </div>
          <Link href="/admin" className={styles.backButton}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          <div className={styles.errorIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={styles.errorText}>
            <h3 className={styles.errorTitle}>Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Total Users</h3>
            <p className={styles.statValue}>{stats.total}</p>
            <p className={styles.statDescription}>All registered accounts</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Customers</h3>
            <p className={styles.statValue}>{stats.customers}</p>
            <p className={styles.statDescription}>Regular users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Companies</h3>
            <p className={styles.statValue}>{stats.companies}</p>
            <p className={styles.statDescription}>Business accounts</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Admins</h3>
            <p className={styles.statValue}>{stats.admins}</p>
            <p className={styles.statDescription}>Administrator accounts</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Filter & Search</h2>
        </div>
        
        <div className={styles.filterContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="roleFilter" className={styles.filterLabel}>Role:</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              <option value="user">Customers</option>
              <option value="company">Companies</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="searchTerm" className={styles.filterLabel}>Search:</label>
            <input
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name or email..."
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className={styles.usersSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Users ({filteredUsers.length})
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No users found</h3>
            <p className={styles.emptyDescription}>
              {searchTerm || roleFilter !== 'all' 
                ? 'No users match the current filter criteria.'
                : 'No users are registered yet.'
              }
            </p>
          </div>
        ) : (
          <div className={styles.usersTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderCell}>User</div>
              <div className={styles.tableHeaderCell}>Role</div>
              <div className={styles.tableHeaderCell}>Registration</div>
              <div className={styles.tableHeaderCell}>Orders</div>
              <div className={styles.tableHeaderCell}>Actions</div>
            </div>
            
            {filteredUsers.map((userData) => (
              <div key={userData._id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      <span>{userData.name.charAt(0)}</span>
                    </div>
                    <div className={styles.userDetails}>
                      <h3 className={styles.userName}>{userData.name}</h3>
                      <p className={styles.userEmail}>{userData.email}</p>
                      <p className={styles.userPhone}>{userData.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className={styles.tableCell}>
                  {getRoleBadge(userData.role)}
                </div>
                
                <div className={styles.tableCell}>
                  <span className={styles.dateText}>
                    {formatDate(userData.createdAt)}
                  </span>
                </div>
                
                <div className={styles.tableCell}>
                  <span className={styles.ordersCount}>
                    {userData.orders?.length || 0} orders
                  </span>
                </div>
                
                <div className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => {
                        setSelectedUser(userData);
                        setShowModal(true);
                      }}
                      className={styles.viewButton}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                User Details: {selectedUser.name}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className={styles.modalCloseButton}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* User Info */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Account Information</h4>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Name:</span>
                    <span className={styles.modalValue}>{selectedUser.name}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Email:</span>
                    <span className={styles.modalValue}>{selectedUser.email}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Phone:</span>
                    <span className={styles.modalValue}>{selectedUser.phone}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Role:</span>
                    <span className={styles.modalValue}>
                      {getRoleBadge(selectedUser.role)}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Registration Date:</span>
                    <span className={styles.modalValue}>
                      {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Total Orders:</span>
                    <span className={styles.modalValue}>
                      {selectedUser.orders?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className={styles.modalSecondaryButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}