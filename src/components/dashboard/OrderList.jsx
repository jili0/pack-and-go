// src/components/dashboard/OrderList.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/Components.module.css';

const OrderList = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/user/orders');
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.message || 'Failed to load orders.');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('An error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No date specified';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: styles.badgeYellow, text: 'Request Sent' },
      confirmed: { class: styles.badgeGreen, text: 'Confirmed' },
      declined: { class: styles.badgeRed, text: 'Declined' },
      completed: { class: styles.badgeBlue, text: 'Completed' },
      cancelled: { class: styles.badgeGray, text: 'Cancelled' }
    };
    
    const statusInfo = statusMap[status] || { class: styles.badgeGray, text: status };
    
    return (
      <span className={`${styles.badge} ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };
  
  const filteredOrders = () => {
    if (filter === 'all') {
      return orders;
    }
    
    return orders.filter(order => order.status === filter);
  };
  
  const handleViewOrder = (orderId) => {
    router.push(`/user/orders/${orderId}`);
  };
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`${styles.alert} ${styles.alertDanger}`}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className={styles.orderList}>
      <div className={styles.orderListHeader}>
        <h2>My Orders</h2>
        <div className={styles.filterContainer}>
          <label htmlFor="statusFilter" className={styles.filterLabel}>
            Filter by status:
          </label>
          <select
            id="statusFilter"
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📦</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any moving orders yet.</p>
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => router.push('/')}
          >
            Plan Your Move
          </button>
        </div>
      ) : filteredOrders().length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No {filter} Orders</h3>
          <p>You don't have any orders with status "{filter}".</p>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setFilter('all')}
          >
            Show All Orders
          </button>
        </div>
      ) : (
        <div className={styles.orderCards}>
          {filteredOrders().map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderCardHeader}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className={styles.orderPrice}>{order.totalPrice} €</div>
              </div>
              
              <div className={styles.orderCardBody}>
                <div className={styles.routeInfo}>
                  <div className={styles.locationFrom}>
                    <span className={styles.locationLabel}>From:</span>
                    <span className={styles.locationCity}>{order.fromAddress.city}</span>
                  </div>
                  <div className={styles.routeArrow}>→</div>
                  <div className={styles.locationTo}>
                    <span className={styles.locationLabel}>To:</span>
                    <span className={styles.locationCity}>{order.toAddress.city}</span>
                  </div>
                </div>
                
                <div className={styles.companyInfo}>
                  <span className={styles.companyLabel}>Company:</span>
                  <span className={styles.companyName}>{order.companyName}</span>
                </div>
                
                <div className={styles.dateInfo}>
                  <span className={styles.dateLabel}>
                    {order.status === 'pending' ? 'Preferred Date:' : 'Moving Date:'}
                  </span>
                  <span className={styles.dateValue}>
                    {order.confirmedDate 
                      ? formatDate(order.confirmedDate)
                      : formatDate(order.preferredDates[0])
                    }
                    {order.status === 'pending' && (
                      <span className={styles.pendingNote}>(waiting for confirmation)</span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className={styles.orderCardFooter}>
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => handleViewOrder(order._id)}
                >
                  View Details
                </button>
                
                {order.status === 'completed' && !order.review && (
                  <button 
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => router.push(`/user/orders/${order._id}/review`)}
                  >
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.newOrderButtonContainer}>
        <button 
          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
          onClick={() => router.push('/')}
        >
          Plan a New Move
        </button>
      </div>
    </div>
  );
};

export default OrderList;