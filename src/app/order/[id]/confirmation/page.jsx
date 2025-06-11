// src/app/order/[id]/confirmation/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from '@/components/ui/Image';
// import styles from '@/app/styles/Components.module.css';
import styles from '@/app/styles/OrderConfirmation.module.css';

export default function OrderConfirmation({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
    
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setOrder(data.order);
          setCompany(data.company);
        } else {
          setError(data.message || 'The order details could not be loaded.');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('An error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, user, router]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date specified';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
      <div className={styles.container}>
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <h3>Error</h3>
          <p>{error}</p>
          <Link href="/user/orders" className={`${styles.btn} ${styles.btnPrimary}`}>
            View My Orders
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order || !company) {
    return (
      <div className={styles.container}>
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <h3>Order Not Found</h3>
          <p>The requested order could not be found.</p>
          <Link href="/user/orders" className={`${styles.btn} ${styles.btnPrimary}`}>
            View My Orders
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.confirmationPage}>
        {/* Success Message */}
        <div className={styles.successBanner}>
          <div className={styles.successIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1>Thank You for Your Order!</h1>
          <p>Your booking has been submitted successfully and is currently being reviewed by the moving company.</p>
        </div>
        
        {/* Order Overview */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Order Overview</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.orderInfo}>
              <div className={styles.orderIdSection}>
                <span className={styles.orderLabel}>Order ID:</span>
                <span className={styles.orderId}>{order._id}</span>
              </div>
              
              <div className={styles.orderStatusSection}>
                <span className={styles.orderLabel}>Order Status:</span>
                <span className={`${styles.badge} ${styles.badgeYellow}`}>
                  Request Sent
                </span>
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
                  <span className={styles.detailLabel}>Preferred Date:</span>
                  <span className={styles.detailValue}>
                    {formatDate(order.preferredDates[0])}
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
        </div>
        
        {/* What's Next */}
        <div className={styles.whatsNextSection}>
          <h2>What's Next?</h2>
          <div className={styles.stepGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3>Confirmation</h3>
              <p>The moving company will review your request and confirm one of your preferred dates.</p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3>Preparation</h3>
              <p>Once confirmed, you can prepare for your move. Check out our <Link href="/tips">Tips</Link> for helpful advice.</p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3>Moving Day</h3>
              <p>On the agreed date, the moving team will arrive at your location to help with your move.</p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <h3>Feedback</h3>
              <p>After your move is complete, please share your experience by leaving a review.</p>
            </div>
          </div>
        </div>
        
        {/* Email Notification */}
        <div className={styles.emailNotification}>
          <div className={styles.emailIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div className={styles.emailMessage}>
            <h3>Check Your Email</h3>
            <p>We've sent a confirmation email to <strong>{user.email}</strong> with all the details of your order.</p>
            <p>If you don't see it, please check your spam folder.</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <Link 
            href={`/user/orders/${order._id}`} 
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            View Order Details
          </Link>
          
          <Link 
            href="/user/orders" 
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            View All Orders
          </Link>
          
          <Link 
            href="/" 
            className={`${styles.btn} ${styles.btnOutline}`}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}