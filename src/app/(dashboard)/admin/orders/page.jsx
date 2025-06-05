'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/AdminOrders.module.css';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on status and search
  useEffect(() => {
    let filtered = orders;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fromAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.toAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Error loading orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: `${styles.statusBadge} ${styles.statusPending}`, text: 'Pending' },
      confirmed: { class: `${styles.statusBadge} ${styles.statusConfirmed}`, text: 'Confirmed' },
      declined: { class: `${styles.statusBadge} ${styles.statusDeclined}`, text: 'Declined' },
      completed: { class: `${styles.statusBadge} ${styles.statusCompleted}`, text: 'Completed' },
      cancelled: { class: `${styles.statusBadge} ${styles.statusCancelled}`, text: 'Cancelled' }
    };
    
    const statusInfo = statusMap[status] || { class: styles.statusBadge, text: status };
    
    return (
      <span className={statusInfo.class}>
        {statusInfo.text}
      </span>
    );
  };

  const getStats = () => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return { 
      total: orders.length, 
      pending, 
      confirmed, 
      completed, 
      cancelled,
      totalRevenue 
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.ordersContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Order Management</h1>
            <p className={styles.pageDescription}>
              Monitor and manage all platform orders
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
            <h3 className={styles.statTitle}>Total Orders</h3>
            <p className={styles.statValue}>{stats.total}</p>
            <p className={styles.statDescription}>All platform orders</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Pending</h3>
            <p className={styles.statValue}>{stats.pending}</p>
            <p className={styles.statDescription}>Awaiting response</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Active</h3>
            <p className={styles.statValue}>{stats.confirmed}</p>
            <p className={styles.statDescription}>Confirmed orders</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Completed</h3>
            <p className={styles.statValue}>{stats.completed}</p>
            <p className={styles.statDescription}>Finished moves</p>
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
            <label htmlFor="statusFilter" className={styles.filterLabel}>Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="searchTerm" className={styles.filterLabel}>Search:</label>
            <input
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order ID, customer, company, or city..."
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Orders ({filteredOrders.length})
          </h2>
        </div>

        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No orders found</h3>
            <p className={styles.emptyDescription}>
              {searchTerm || statusFilter !== 'all' 
                ? 'No orders match the current filter criteria.'
                : 'No orders have been placed yet.'
              }
            </p>
          </div>
        ) : (
          <div className={styles.ordersTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderCell}>Order</div>
              <div className={styles.tableHeaderCell}>Customer</div>
              <div className={styles.tableHeaderCell}>Company</div>
              <div className={styles.tableHeaderCell}>Route</div>
              <div className={styles.tableHeaderCell}>Status</div>
              <div className={styles.tableHeaderCell}>Price</div>
              <div className={styles.tableHeaderCell}>Date</div>
              <div className={styles.tableHeaderCell}>Actions</div>
            </div>
            
            {filteredOrders.map((order) => (
              <div key={order._id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>#{order._id.slice(-8)}</span>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderHelpers}>{order.helpersCount} helpers</span>
                      <span className={styles.orderHours}>{order.estimatedHours}h</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.tableCell}>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{order.customerName || 'Unknown'}</span>
                    <span className={styles.customerEmail}>{order.customerEmail}</span>
                  </div>
                </div>
                
                <div className={styles.tableCell}>
                  <span className={styles.companyName}>{order.companyName || 'Unknown'}</span>
                </div>
                
                <div className={styles.tableCell}>
                  <div className={styles.routeInfo}>
                    <span className={styles.routeFrom}>{order.fromAddress?.city}</span>
                    <span className={styles.routeArrow}>→</span>
                    <span className={styles.routeTo}>{order.toAddress?.city}</span>
                  </div>
                </div>
                
                <div className={styles.tableCell}>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className={styles.tableCell}>
                  <span className={styles.priceValue}>
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
                
                <div className={styles.tableCell}>
                  <span className={styles.dateText}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                
                <div className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
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

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Order Details: #{selectedOrder._id.slice(-8)}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedOrder(null);
                }}
                className={styles.modalCloseButton}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Order Info */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Order Information</h4>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Order ID:</span>
                    <span className={styles.modalValue}>{selectedOrder._id}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Status:</span>
                    <span className={styles.modalValue}>
                      {getStatusBadge(selectedOrder.status)}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Total Price:</span>
                    <span className={styles.modalValue}>
                      {formatCurrency(selectedOrder.totalPrice)}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Helpers:</span>
                    <span className={styles.modalValue}>{selectedOrder.helpersCount}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Estimated Hours:</span>
                    <span className={styles.modalValue}>{selectedOrder.estimatedHours}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Created:</span>
                    <span className={styles.modalValue}>
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Company */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Parties</h4>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Customer:</span>
                    <span className={styles.modalValue}>{selectedOrder.customerName}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Customer Email:</span>
                    <span className={styles.modalValue}>{selectedOrder.customerEmail}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Company:</span>
                    <span className={styles.modalValue}>{selectedOrder.companyName}</span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Route</h4>
                <div className={styles.addressGrid}>
                  <div className={styles.addressCard}>
                    <h5 className={styles.addressTitle}>From</h5>
                    <p className={styles.addressText}>
                      {selectedOrder.fromAddress?.street}<br/>
                      {selectedOrder.fromAddress?.postalCode} {selectedOrder.fromAddress?.city}<br/>
                      {selectedOrder.fromAddress?.country}
                    </p>
                  </div>
                  <div className={styles.addressCard}>
                    <h5 className={styles.addressTitle}>To</h5>
                    <p className={styles.addressText}>
                      {selectedOrder.toAddress?.street}<br/>
                      {selectedOrder.toAddress?.postalCode} {selectedOrder.toAddress?.city}<br/>
                      {selectedOrder.toAddress?.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Dates</h4>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Preferred Dates:</span>
                    <span className={styles.modalValue}>
                      {selectedOrder.preferredDates?.map(date => 
                        formatDate(date)
                      ).join(', ') || 'None specified'}
                    </span>
                  </div>
                  {selectedOrder.confirmedDate && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>Confirmed Date:</span>
                      <span className={styles.modalValue}>
                        {formatDate(selectedOrder.confirmedDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Notes</h4>
                  <p className={styles.modalNotes}>{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedOrder(null);
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