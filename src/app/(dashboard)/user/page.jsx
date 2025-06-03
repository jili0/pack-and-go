// // src/app/(dashboard)/user/page.jsx (continuing from previous part)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/UserDashboard.module.css'; // CSS Module import

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/user');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/user/orders');
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.orders);
          
          const now = new Date();
          const upcoming = data.orders.filter(order => {
            const orderDate = order.confirmedDate 
              ? new Date(order.confirmedDate) 
              : order.preferredDates.length > 0 
                ? new Date(order.preferredDates[0]) 
                : null;
            
            return orderDate && orderDate >= now;
          });
          
          const past = data.orders.filter(order => {
            const orderDate = order.confirmedDate 
              ? new Date(order.confirmedDate) 
              : order.preferredDates.length > 0 
                ? new Date(order.preferredDates[0]) 
                : null;
            
            return !orderDate || orderDate < now;
          });
          
          setUpcomingOrders(upcoming);
          setPastOrders(past);
        } else {
          setError(data.message || 'Die Bestellungen konnten nicht geladen werden.');
        }
      } catch (error) {
        console.error('Fehler beim Laden der Bestellungen:', error);
        setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  if (loading || (!user && !loading)) {
    return (
      <div className={styles.userDashboard}>
        <div className={styles.dashboardContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingContent}>
              <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h2 className={styles.loadingText}>Wird geladen...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Kein Datum';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };
  
  const StatusBadge = ({ status }) => {
    let colorClass;
    let text;
    
    switch (status) {
      case 'pending':
        colorClass = `${styles.bgYellow100} ${styles.textYellow800}`;
        text = 'Anfrage gesendet';
        break;
      case 'confirmed':
        colorClass = `${styles.bgGreen100} ${styles.textGreen800}`;
        text = 'Bestätigt';
        break;
      case 'declined':
        colorClass = `${styles.bgRed100} ${styles.textRed800}`;
        text = 'Abgelehnt';
        break;
      case 'completed':
        colorClass = `${styles.bgBlue100} ${styles.textBlue800}`;
        text = 'Abgeschlossen';
        break;
      case 'cancelled':
        colorClass = `${styles.bgGray100} ${styles.textGray800}`;
        text = 'Storniert';
        break;
      default:
        colorClass = `${styles.bgGray100} ${styles.textGray800}`;
        text = status;
    }
    
    return (
      <span className={`${styles.statusBadge} ${colorClass}`}>
        {text}
      </span>
    );
  };
  
  return (
    <div className={styles.userDashboard}>
      <div className={styles.dashboardContainer}>
        {/* Greeting */}
        <div className={styles.greeting}>
          <h1 className={styles.greetingTitle}>Hallo, {user.name}</h1>
          <p className={styles.greetingSubtitle}>
            Willkommen in Ihrem persönlichen Dashboard
          </p>
        </div>
        
        {/* Quick Access */}
        <div className={styles.quickAccessContainer}>
          <div className={`${styles.quickAccessHeader} ${styles.bgGray50}`}>
            <h2 className={styles.quickAccessTitle}>Schnellzugriff</h2>
          </div>
          <div className={styles.quickAccessGrid}>
            <Link
              href="/"
              className={`${styles.quickAccessCard} ${styles.bgBlue50}`}
            >
              <div className={`${styles.quickAccessIconContainer} ${styles.bgBlue100}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`${styles.quickAccessIcon} ${styles.textBlue600}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className={styles.quickAccessCardContent}>
                <h3 className={styles.quickAccessCardTitle}>Neuen Umzug planen</h3>
                <p className={styles.quickAccessCardDescription}>Erhalten Sie Angebote von Umzugsfirmen</p>
              </div>
            </Link>
            
            <Link
              href="/user/orders"
              className={`${styles.quickAccessCard} ${styles.bgPurple50}`}
            >
              <div className={`${styles.quickAccessIconContainer} ${styles.bgPurple100}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`${styles.quickAccessIcon} ${styles.textPurple600}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className={styles.quickAccessCardContent}>
                <h3 className={styles.quickAccessCardTitle}>Meine Bestellungen</h3>
                <p className={styles.quickAccessCardDescription}>Alle Ihre Umzüge anzeigen</p>
              </div>
            </Link>
            
            <Link
              href="/user/profile"
              className={`${styles.quickAccessCard} ${styles.bgGreen50}`}
            >
              <div className={`${styles.quickAccessIconContainer} ${styles.bgGreen100}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`${styles.quickAccessIcon} ${styles.textGreen600}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className={styles.quickAccessCardContent}>
                <h3 className={styles.quickAccessCardTitle}>Mein Profil</h3>
                <p className={styles.quickAccessCardDescription}>Persönliche Daten verwalten</p>
              </div>
            </Link>
          </div>
        </div>
        
        {error && (
          <div className={`${styles.errorMessage} ${styles.bgRed50}`}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>
                <svg className={styles.textRed400} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={styles.errorText}>
                <h3 className={styles.errorTitle}>
                  Es ist ein Fehler aufgetreten
                </h3>
                <div className={styles.errorDescription}>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Upcoming Orders */}
        <div className={styles.ordersSection}>
          <div className={`${styles.ordersHeader} ${styles.bgGray50}`}>
            <h2 className={styles.ordersTitle}>Bevorstehende Umzüge</h2>
            <Link
              href="/user/orders"
              className={styles.viewAllLink}
            >
              Alle anzeigen
            </Link>
          </div>
          <div className={styles.ordersContent}>
            {dataLoading ? (
              <div className={styles.emptyState}>
                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className={styles.emptyDescription}>Bestellungen werden geladen...</p>
              </div>
            ) : upcomingOrders.length > 0 ? (
              <div className={styles.divideY}>
                {upcomingOrders.slice(0, 3).map((order) => (
                  <div key={order._id} className={styles.orderItem}>
                    <div className={styles.orderHeader}>
                      <h3 className={styles.orderTitle}>
                        Umzug von {order.fromAddress.city} nach {order.toAddress.city}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className={styles.orderDetailsGrid}>
                      <div>
                        <p className={styles.detailLabel}>Umzugsfirma</p>
                        <p className={styles.detailValue}>{order.companyName}</p>
                      </div>
                      <div>
                        <p className={styles.detailLabel}>Umzugsdatum</p>
                        <p className={styles.detailValue}>
                          {order.confirmedDate 
                            ? formatDate(order.confirmedDate) 
                            : (order.preferredDates && order.preferredDates.length > 0
                                ? formatDate(order.preferredDates[0]) + ' (nicht bestätigt)'
                                : 'Kein Datum festgelegt'
                              )
                          }
                        </p>
                      </div>
                      <div>
                        <p className={styles.detailLabel}>Helfer / Stunden</p>
                        <p className={styles.detailValue}>{order.helpersCount} Helfer / {order.estimatedHours} Std.</p>
                      </div>
                      <div>
                        <p className={styles.detailLabel}>Preis</p>
                        <p className={styles.detailValue}>{order.totalPrice} €</p>
                      </div>
                    </div>
                    <div className={styles.mt4}>
                      <Link
                        href={`/order/${order._id}`}
                        className={`${styles.detailLink} ${styles.bgBlue100}`}
                      >
                        Details anzeigen
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className={`${styles.emptyTitle} ${styles.textGray900}`}>Keine bevorstehenden Umzüge</h3>
                <p className={styles.emptyDescription}>Sie haben derzeit keine geplanten Umzüge.</p>
                <Link 
                  href="/"
                  className={`${styles.primaryButton} ${styles.bgBlue600}`}
                >
                  Jetzt Umzug planen
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Activities */}
        <div className={styles.ordersSection}>
          <div className={`${styles.ordersHeader} ${styles.bgGray50}`}>
            <h2 className={styles.ordersTitle}>Letzte Aktivitäten</h2>
          </div>
          <div className={styles.ordersContent}>
            {dataLoading ? (
              <div className={styles.emptyState}>
                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className={styles.emptyDescription}>Aktivitäten werden geladen...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className={styles.p6}>
                <ul className={styles.spaceY6}>
                  {orders.slice(0, 5).map((order) => (
                    <li key={order._id} className={styles.activityItem}>
                      <div className={styles.activityLine} aria-hidden="true"></div>
                      <div className={styles.activityDot} aria-hidden="true"></div>
                      <div className={styles.activityHeader}>
                        <div>
                          <h3 className={styles.activityTitle}>
                            {order.status === 'pending' && 'Umzugsanfrage gesendet'}
                            {order.status === 'confirmed' && 'Umzug bestätigt'}
                            {order.status === 'declined' && 'Umzugsanfrage abgelehnt'}
                            {order.status === 'completed' && 'Umzug abgeschlossen'}
                            {order.status === 'cancelled' && 'Umzug storniert'}
                          </h3>
                          <p className={styles.activityDescription}>
                            Umzug von {order.fromAddress.city} nach {order.toAddress.city}
                          </p>
                        </div>
                        <time className={styles.activityTime}>{formatDate(order.createdAt)}</time>
                      </div>
                      <div className={styles.mt2}>
                        <Link
                          href={`/order/${order._id}`}
                          className={styles.activityLink}
                        >
                          Details anzeigen
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className={styles.emptyTitle}>Keine Aktivitäten</h3>
                <p className={styles.emptyDescription}>Sie haben noch keine Aktivitäten auf der Plattform.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Tips & Help */}
        <div className={styles.ordersSection}>
          <div className={`${styles.ordersHeader} ${styles.bgGray50}`}>
            <h2 className={styles.ordersTitle}>Tipps & Hilfe</h2>
          </div>
          <div className={styles.quickAccessGrid}>
            <Link href="/umzugstipps" className={styles.block}>
              <div className={`${styles.tipCard} ${styles.bgYellow50}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`${styles.tipIcon} ${styles.textYellow600}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className={styles.tipTitle}>Umzugstipps</h3>
                <p className={styles.tipDescription}>Nützliche Tipps und Tricks für einen stressfreien Umzug</p>
              </div>
            </Link>
            
            <Link href="/checkliste" className={styles.block}>
              <div className={`${styles.tipCard} ${styles.bgGreen50}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`${styles.tipIcon} ${styles.textGreen600}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h3 className={styles.tipTitle}>Umzugs-Checkliste</h3>
                <p className={styles.tipDescription}>Schritt-für-Schritt-Anleitung für Ihren Umzug</p>
              </div>
            </Link>
            
            <Link href="/kontakt" className={styles.block}>
              <div className={`${styles.tipCard} ${styles.bgBlue50}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`${styles.tipIcon} ${styles.textBlue600}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className={styles.tipTitle}>Support</h3>
                <p className={styles.tipDescription}>Haben Sie Fragen? Unser Team hilft Ihnen gerne weiter</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}