// src/app/(dashboard)/user/page.jsx (continuing from previous part)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Leite zur Login-Seite weiter, wenn der Benutzer nicht angemeldet ist
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/user');
    }
  }, [user, loading, router]);
  
  // Lade die Bestellungen des Benutzers
  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/user/orders');
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.orders);
          
          // Filtere bevorstehende und vergangene Bestellungen
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h2 className="text-lg font-medium text-gray-900">Wird geladen...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Formatiere das Datum für die Anzeige
  const formatDate = (dateString) => {
    if (!dateString) return 'Kein Datum';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };
  
  // Status-Badge-Komponente
  const StatusBadge = ({ status }) => {
    let color;
    let text;
    
    switch (status) {
      case 'pending':
        color = 'bg-yellow-100 text-yellow-800';
        text = 'Anfrage gesendet';
        break;
      case 'confirmed':
        color = 'bg-green-100 text-green-800';
        text = 'Bestätigt';
        break;
      case 'declined':
        color = 'bg-red-100 text-red-800';
        text = 'Abgelehnt';
        break;
      case 'completed':
        color = 'bg-blue-100 text-blue-800';
        text = 'Abgeschlossen';
        break;
      case 'cancelled':
        color = 'bg-gray-100 text-gray-800';
        text = 'Storniert';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
        text = status;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Begrüßung */}
        <div className="pb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hallo, {user.name}</h1>
          <p className="mt-2 text-lg text-gray-600">
            Willkommen in Ihrem persönlichen Dashboard
          </p>
        </div>
        
        {/* Schnellzugriff */}
        <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Schnellzugriff</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-900">Neuen Umzug planen</h3>
                  <p className="text-sm text-gray-600 mt-1">Erhalten Sie Angebote von Umzugsfirmen</p>
                </div>
              </Link>
              
              <Link
                href="/user/orders"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex-shrink-0 bg-purple-100 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-900">Meine Bestellungen</h3>
                  <p className="text-sm text-gray-600 mt-1">Alle Ihre Umzüge anzeigen</p>
                </div>
              </Link>
              
              <Link
                href="/user/profile"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-900">Mein Profil</h3>
                  <p className="text-sm text-gray-600 mt-1">Persönliche Daten verwalten</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Es ist ein Fehler aufgetreten
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bevorstehende Umzüge */}
        <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Bevorstehende Umzüge</h2>
            <Link
              href="/user/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Alle anzeigen
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {dataLoading ? (
              <div className="p-6 text-center">
                <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500">Bestellungen werden geladen...</p>
              </div>
            ) : upcomingOrders.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {upcomingOrders.slice(0, 3).map((order) => (
                  <div key={order._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        Umzug von {order.fromAddress.city} nach {order.toAddress.city}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Umzugsfirma</p>
                        <p className="text-sm font-medium text-gray-900">{order.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Umzugsdatum</p>
                        <p className="text-sm font-medium text-gray-900">
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
                        <p className="text-sm text-gray-500">Helfer / Stunden</p>
                        <p className="text-sm font-medium text-gray-900">{order.helpersCount} Helfer / {order.estimatedHours} Std.</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Preis</p>
                        <p className="text-sm font-medium text-gray-900">{order.totalPrice} €</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/order/${order._id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Details anzeigen
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-base font-medium text-gray-900 mb-1">Keine bevorstehenden Umzüge</h3>
                <p className="text-gray-500 mb-4">Sie haben derzeit keine geplanten Umzüge.</p>
                <Link 
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Jetzt Umzug planen
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Letzte Aktivitäten */}
        <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Letzte Aktivitäten</h2>
          </div>
          <div className="border-t border-gray-200">
            {dataLoading ? (
              <div className="p-6 text-center">
                <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500">Aktivitäten werden geladen...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="p-6">
                <ul className="space-y-6">
                  {orders.slice(0, 5).map((order) => (
                    <li key={order._id} className="relative pl-6">
                      <div className="absolute top-3 left-0 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                      <div className="absolute top-3 left-0 -ml-1.5 h-3 w-3 rounded-full border-2 border-blue-600 bg-white" aria-hidden="true"></div>
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {order.status === 'pending' && 'Umzugsanfrage gesendet'}
                            {order.status === 'confirmed' && 'Umzug bestätigt'}
                            {order.status === 'declined' && 'Umzugsanfrage abgelehnt'}
                            {order.status === 'completed' && 'Umzug abgeschlossen'}
                            {order.status === 'cancelled' && 'Umzug storniert'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Umzug von {order.fromAddress.city} nach {order.toAddress.city}
                          </p>
                        </div>
                        <time className="text-sm text-gray-500">{formatDate(order.createdAt)}</time>
                      </div>
                      <div className="mt-2">
                        <Link
                          href={`/order/${order._id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Details anzeigen
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base font-medium text-gray-900 mb-1">Keine Aktivitäten</h3>
                <p className="text-gray-500">Sie haben noch keine Aktivitäten auf der Plattform.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Tipps & Hilfe */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Tipps & Hilfe</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/umzugstipps" className="block">
                <div className="p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="text-base font-medium text-gray-900 mb-1">Umzugstipps</h3>
                  <p className="text-sm text-gray-600">Nützliche Tipps und Tricks für einen stressfreien Umzug</p>
                </div>
              </Link>
              
              <Link href="/kontakt" className="block">
                <div className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="text-base font-medium text-gray-900 mb-1">Support</h3>
                  <p className="text-sm text-gray-600">Haben Sie Fragen? Unser Team hilft Ihnen gerne weiter</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}