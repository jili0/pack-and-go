// src/components/dashboard/OrderDetails.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/Components.module.css';
import Image from '@/components/ui/Image';

const OrderDetails = ({ orderId }) => {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        
        if (data.success) {
          setOrder(data.order);
          setCompany(data.company);
        } else {
          setError(data.message || 'Failed to load order details.');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('An error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);
  
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
  
  const handleCancelOrder = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        setShowCancelModal(false);
      } else {
        setError(data.message || 'Failed to cancel order.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`${styles.alert} ${styles.alertDanger}`}>
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={() => router.push('/user/orders')}
        >
          Back to Orders
        </button>
      </div>
    );
  }
  
  if (!order || !company) {
    return (
      <div className={`${styles.alert} ${styles.alertDanger}`}>
        <h3>Order Not Found</h3>
        <p>The requested order could not be found.</p>
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={() => router.push('/user/orders')}
        >
          Back to Orders
        </button>
      </div>
    );
  }
  
  return (
    <div className={styles.orderDetails}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.orderHeader}>
            <h2>Order Details</h2>
            {getStatusBadge(order.status)}
          </div>
        </div>
        
        <div className={styles.cardBody}>
          {/* Order ID and Date */}
          <div className={styles.detailSection}>
            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>Order ID:</span>
              <span className={styles.detailValue}>{order._id}</span>
            </div>
            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>Order Date:</span>
              <span className={styles.detailValue}>{formatDate(order.createdAt)}</span>
            </div>
          </div>
          
          {/* Moving Company */}
          <div className={styles.companySection}>
            <h3>Moving Company</h3>
            <div className={styles.companyInfo}>
              <div className={styles.companyLogo}>
                {company.logo ? (
                  <Image 
                    src={company.logo} 
                    alt={company.companyName} 
                    width={64} 
                    height={64} 
                    className={styles.logoImage} 
                  />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <span>{company.companyName.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className={styles.companyDetails}>
                <h4>{company.companyName}</h4>
                <div className={styles.companyRating}>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(company.averageRating) ? styles.starFilled : styles.starEmpty}>★</span>
                    ))}
                  </div>
                  <span className={styles.ratingCount}>
                    ({company.reviewsCount} {company.reviewsCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                {company.isKisteKlarCertified && (
                  <div className={`${styles.badge} ${styles.badgeGreen}`}>
                    KisteKlar Certified
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Moving Details */}
          <div className={styles.movingDetails}>
            <h3>Moving Details</h3>
            <div className={styles.addressSection}>
              <div className={styles.addressFrom}>
                <h4>From</h4>
                <p>{order.fromAddress.street}</p>
                <p>{order.fromAddress.postalCode} {order.fromAddress.city}</p>
                <p>{order.fromAddress.country}</p>
              </div>
              <div className={styles.addressArrow}>→</div>
              <div className={styles.addressTo}>
                <h4>To</h4>
                <p>{order.toAddress.street}</p>
                <p>{order.toAddress.postalCode} {order.toAddress.city}</p>
                <p>{order.toAddress.country}</p>
              </div>
            </div>
            
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Moving Date:</span>
                <span className={styles.detailValue}>
                  {order.confirmedDate 
                    ? formatDate(order.confirmedDate) 
                    : (
                      <>
                        <span className={styles.pendingText}>
                          Preferred: {formatDate(order.preferredDates[0])}
                        </span>
                        <small className={styles.pendingNote}>
                          (Waiting for confirmation)
                        </small>
                      </>
                    )
                  }
                </span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Helpers:</span>
                <span className={styles.detailValue}>{order.helpersCount}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Estimated Hours:</span>
                <span className={styles.detailValue}>{order.estimatedHours}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Total Price:</span>
                <span className={`${styles.detailValue} ${styles.priceValue}`}>
                  {order.totalPrice} €
                </span>
              </div>
            </div>
            
            {order.notes && (
              <div className={styles.notesSection}>
                <h4>Additional Notes</h4>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.cardFooter}>
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`} 
              onClick={() => router.back()}
            >
              Back
            </button>
            
            {order.status === 'pending' && (
              <button 
                className={`${styles.btn} ${styles.btnDanger}`} 
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Order
              </button>
            )}
            
            {order.status === 'completed' && !order.review && (
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={() => router.push(`/user/orders/${orderId}/review`)}
              >
                Leave Review
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Cancel Order</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to cancel this order?</p>
              <p className={styles.warningText}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`} 
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep Order
              </button>
              <button 
                className={`${styles.btn} ${styles.btnDanger}`} 
                onClick={handleCancelOrder}
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;