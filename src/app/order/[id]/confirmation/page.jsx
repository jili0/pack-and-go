// src/app/order/[id]/confirmation/page.jsx (continuing from previous part)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import StarRating from '@/components/ui/StarRating';

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
      // Wenn nicht angemeldet, zur Login-Seite weiterleiten
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
          setError(data.message || 'Die Bestelldetails konnten nicht geladen werden.');
        }
      } catch (error) {
        console.error('Fehler beim Laden der Bestelldetails:', error);
        setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, user, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h2 className="text-lg font-medium text-gray-900">Bestelldetails werden geladen...</h2>
              <p className="mt-1 text-sm text-gray-500">Bitte haben Sie einen Moment Geduld.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ein Fehler ist aufgetreten</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/user" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Zum Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order || !company) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bestellung nicht gefunden</h2>
            <p className="text-gray-600 mb-6">Die angeforderte Bestellung konnte nicht gefunden werden.</p>
            <Link href="/user" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Zum Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Formatiere das Datum für die Anzeige
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Erfolgsmeldung */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vielen Dank für Ihre Bestellung!</h2>
            <p className="text-gray-600 mb-2">
              Ihre Buchung wurde erfolgreich übermittelt und wird derzeit von der Umzugsfirma geprüft.
            </p>
            <p className="text-gray-600">
              Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details.
            </p>
          </div>
          
          {/* Bestellübersicht */}
          <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Bestellübersicht</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {order.status === 'pending' && 'Anfrage gesendet'}
                {order.status === 'confirmed' && 'Bestätigt'}
                {order.status === 'declined' && 'Abgelehnt'}
                {order.status === 'completed' && 'Abgeschlossen'}
                {order.status === 'cancelled' && 'Storniert'}
              </span>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Bestellnummer</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order._id}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Datum der Bestellung</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(order.createdAt)}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Umzugsdatum</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.confirmedDate 
                      ? formatDate(order.confirmedDate) 
                      : (
                        <>
                          <span className="font-medium">Gewünscht:</span> {formatDate(order.preferredDates[0])}
                          <p className="text-sm text-yellow-600 mt-1">
                            (Wartet auf Bestätigung durch die Umzugsfirma)
                          </p>
                        </>
                      )
                    }
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Umzugsfirma */}
          <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Umzugsfirma</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{company.companyName}</h3>
                  <div className="flex items-center mt-1">
                    <StarRating rating={company.averageRating} />
                    <span className="ml-2 text-sm text-gray-500">
                      ({company.reviewsCount} {company.reviewsCount === 1 ? 'Bewertung' : 'Bewertungen'})
                    </span>
                  </div>
                  {company.isKisteKlarCertified && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-1.5 h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      KisteKlar zertifiziert
                    </div>
                  )}
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Telefon:</span> {company.phone || 'Nicht angegeben'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">E-Mail:</span> {company.email || 'Nicht angegeben'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Umzugsdetails */}
          <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Umzugsdetails</h2>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Von</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.fromAddress.street}, {order.fromAddress.postalCode} {order.fromAddress.city}, {order.fromAddress.country}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nach</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.toAddress.street}, {order.toAddress.postalCode} {order.toAddress.city}, {order.toAddress.country}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Anzahl der Helfer</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.helpersCount}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Geschätzte Stunden</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.estimatedHours}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Gesamtpreis</dt>
                  <dd className="mt-1 text-sm font-medium text-blue-700 sm:mt-0 sm:col-span-2">{order.totalPrice} €</dd>
                </div>
                {order.notes && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Zusätzliche Hinweise</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {/* Wichtige Informationen */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Wichtige Informationen</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Die Umzugsfirma wird sich in Kürze mit Ihnen in Verbindung setzen, um die Details zu besprechen und das Datum zu bestätigen.</span>
              </li>
              <li className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Der endgültige Preis kann sich ändern, wenn die tatsächliche Dauer des Umzugs vom geschätzten Wert abweicht.</span>
              </li>
              <li className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Im Falle einer Stornierung oder Änderung kontaktieren Sie bitte die Umzugsfirma direkt oder unser Kundenserviceteam unter <a href="mailto:support@pack-and-go.de" className="text-blue-600 hover:text-blue-700">support@pack-and-go.de</a>.</span>
              </li>
            </ul>
          </div>
          
          {/* Aktionsbuttons */}
          <div className="flex flex-col sm:flex-row sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/user/orders"
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Meine Bestellungen anzeigen
            </Link>
            <Link 
              href="/"
              className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}