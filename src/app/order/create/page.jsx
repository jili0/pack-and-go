// src/app/order/create/page.jsx (continuing from previous part)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import StarRating from '@/components/ui/StarRating';
import AddressForm from '@/components/forms/AddressForm';

export default function CreateOrder() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dateOptions, setDateOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Lade die gespeicherten Daten aus dem Session Storage
  useEffect(() => {
    if (!user) {
      // Wenn nicht angemeldet, zur Login-Seite weiterleiten
      router.push('/login?redirect=order/create');
      return;
    }
    
    const loadSessionData = () => {
      try {
        const savedCompany = sessionStorage.getItem('selectedCompany');
        const savedFormData = sessionStorage.getItem('movingFormData');
        
        if (!savedCompany || !savedFormData) {
          // Wenn keine Daten gefunden werden, zurück zur Startseite
          router.push('/');
          return;
        }
        
        const parsedCompany = JSON.parse(savedCompany);
        const parsedFormData = JSON.parse(savedFormData);
        
        setSelectedCompany(parsedCompany);
        setFormData(parsedFormData);
        
        // Setze die Datumsoptionen basierend auf den Wunschdaten des Benutzers
        const dates = parsedFormData.preferredDates.filter(date => date);
        if (dates.length > 0) {
          setDateOptions(dates);
          setSelectedDate(dates[0]); // Standardmäßig das erste Datum auswählen
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Bestelldaten:', error);
        setError('Die Bestelldaten konnten nicht geladen werden. Bitte versuchen Sie es erneut.');
        setLoading(false);
      }
    };
    
    loadSessionData();
  }, [user, router]);
  
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  const handleNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };
  
  const handleFromAddressChange = (address) => {
    setFormData({
      ...formData,
      fromAddress: address
    });
  };
  
  const handleToAddressChange = (address) => {
    setFormData({
      ...formData,
      toAddress: address
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      setError('Bitte wählen Sie ein Umzugsdatum aus.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Bereite die Bestelldaten vor
      const orderData = {
        companyId: selectedCompany._id,
        fromAddress: formData.fromAddress,
        toAddress: formData.toAddress,
        preferredDates: [selectedDate],
        helpersCount: formData.helpersCount,
        estimatedHours: formData.estimatedHours,
        totalPrice: selectedCompany.hourlyRate * formData.helpersCount * formData.estimatedHours,
        notes: additionalNotes
      };
      
      // Sende die Anfrage an den Server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Lösche die temporären Daten aus dem Session Storage
        sessionStorage.removeItem('selectedCompany');
        sessionStorage.removeItem('movingFormData');
        sessionStorage.removeItem('searchResults');
        
        // Weiterleitung zur Bestellbestätigungsseite
        router.push(`/order/${data.order._id}/confirmation`);
      } else {
        setError(data.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Bestellung:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setSubmitting(false);
    }
  };
  
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
              <h2 className="text-lg font-medium text-gray-900">Daten werden geladen...</h2>
              <p className="mt-1 text-sm text-gray-500">Bitte haben Sie einen Moment Geduld.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !selectedCompany) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ein Fehler ist aufgetreten</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Berechne den Gesamtpreis
  const totalPrice = selectedCompany 
    ? selectedCompany.hourlyRate * formData.helpersCount * formData.estimatedHours 
    : 0;
  
  // Formatiere das Datum für die Anzeige
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Kopfbereich */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Umzug buchen</h1>
            <p className="mt-2 text-lg text-gray-600">
              Überprüfen Sie die Details und bestätigen Sie Ihre Buchung
            </p>
          </div>
          
          <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Ausgewählte Umzugsfirma</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{selectedCompany.companyName}</h3>
                  <div className="flex items-center mt-1">
                    <StarRating rating={selectedCompany.averageRating} />
                    <span className="ml-2 text-sm text-gray-500">
                      ({selectedCompany.reviewsCount} {selectedCompany.reviewsCount === 1 ? 'Bewertung' : 'Bewertungen'})
                    </span>
                  </div>
                  {selectedCompany.isKisteKlarCertified && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-1.5 h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      KisteKlar zertifiziert
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Adressen */}
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">Adressen</h2>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <AddressForm
                      label="Von"
                      initialValues={formData.fromAddress}
                      onChange={handleFromAddressChange}
                    />
                    <AddressForm
                      label="Nach"
                      initialValues={formData.toAddress}
                      onChange={handleToAddressChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* Umzugsdetails */}
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">Umzugsdetails</h2>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="helpersCount" className="block text-sm font-medium text-gray-700">
                        Anzahl der Helfer
                      </label>
                      <div className="mt-1 text-gray-900">
                        {formData.helpersCount} Helfer
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
                        Geschätzte Stunden
                      </label>
                      <div className="mt-1 text-gray-900">
                        {formData.estimatedHours} Stunden
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="moveDate" className="block text-sm font-medium text-gray-700">
                        Umzugsdatum
                      </label>
                      <div className="mt-1">
                        <select
                          id="moveDate"
                          name="moveDate"
                          value={selectedDate}
                          onChange={handleDateChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          {dateOptions.map((date, index) => (
                            <option key={index} value={date}>
                              {formatDate(date)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Zusätzliche Hinweise zum Umzug
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="notes"
                          name="notes"
                          rows={4}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Spezielle Anweisungen oder Informationen für die Umzugsfirma"
                          value={additionalNotes}
                          onChange={handleNotesChange}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Teilen Sie uns mit, wenn es besondere Gegenstände, Parksituationen oder andere wichtige Informationen gibt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preisübersicht */}
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">Preisübersicht</h2>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="space-y-4">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Stundensatz pro Helfer</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedCompany.hourlyRate} €</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Anzahl der Helfer</dt>
                      <dd className="text-sm font-medium text-gray-900">{formData.helpersCount}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Geschätzte Stunden</dt>
                      <dd className="text-sm font-medium text-gray-900">{formData.estimatedHours}</dd>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                      <dt className="text-base font-medium text-gray-900">Gesamtpreis</dt>
                      <dd className="text-base font-medium text-blue-700">{totalPrice} €</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm text-gray-500">
                    Der endgültige Preis kann sich basierend auf der tatsächlichen Dauer des Umzugs ändern.
                  </p>
                </div>
              </div>
              
              {/* Bestätigungsbutton */}
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
              
              <div className="flex justify-between items-center">
                <Link 
                  href="/search-results"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Zurück
                </Link>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Wird gesendet...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Jetzt verbindlich buchen
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}