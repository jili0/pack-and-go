// src/app/search-results/page.jsx (continuing from previous part)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompanyCard from '@/components/ui/CompanyCard';
import Link from 'next/link';

export default function SearchResults() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' oder 'certified'
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Lade die gespeicherten Formulardaten und Suchergebnisse aus dem Session Storage
    const loadSessionData = () => {
      try {
        const savedFormData = sessionStorage.getItem('movingFormData');
        const savedResults = sessionStorage.getItem('searchResults');
        
        if (!savedFormData || !savedResults) {
          // Wenn keine Daten gefunden werden, zurück zur Startseite
          router.push('/');
          return;
        }
        
        setFormData(JSON.parse(savedFormData));
        setCompanies(JSON.parse(savedResults));
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Suchergebnisse:', error);
        setError('Die Suchergebnisse konnten nicht geladen werden. Bitte versuchen Sie es erneut.');
        setLoading(false);
      }
    };
    
    loadSessionData();
  }, [router]);

  // Sortiere die Unternehmen nach ausgewähltem Kriterium
  const sortedCompanies = [...companies].sort((a, b) => {
    if (sortBy === 'rating') {
      // Sortiere nach Bewertung (höchste zuerst)
      return b.averageRating - a.averageRating;
    } else if (sortBy === 'certified') {
      // Sortiere nach Zertifizierung (zertifizierte zuerst)
      if (a.isKisteKlarCertified && !b.isKisteKlarCertified) return -1;
      if (!a.isKisteKlarCertified && b.isKisteKlarCertified) return 1;
      // Bei gleicher Zertifizierung nach Bewertung sortieren
      return b.averageRating - a.averageRating;
    }
    return 0;
  });

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleConfirmSelection = () => {
    // Speichere die ausgewählte Firma und Formulardaten für den Bestellprozess
    sessionStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
    
    // Weiterleitung zur Bestellseite
    router.push('/order/create');
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
              <h2 className="text-lg font-medium text-gray-900">Umzugsfirmen werden geladen...</h2>
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
            <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kopfbereich */}
        <div className="pb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gefundene Umzugsfirmen</h1>
          <p className="mt-2 text-lg text-gray-600">
            Von {formData?.fromAddress?.city || 'Startort'} nach {formData?.toAddress?.city || 'Zielort'}
          </p>
        </div>

        {/* Filterleiste */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {companies.length} Umzugsfirmen gefunden
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Für {formData?.estimatedHours || 0} Stunden mit {formData?.helpersCount || 0} Helfern
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Sortieren nach:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rating">Beste Bewertung</option>
                  <option value="certified">KisteKlar zertifiziert</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Umzugsfirmen-Liste */}
        {sortedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {sortedCompanies.map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                onSelect={handleSelectCompany}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Umzugsfirmen gefunden</h3>
            <p className="text-gray-600 mb-6">
              Leider wurden keine passenden Umzugsfirmen für Ihre Anfrage gefunden.
              Versuchen Sie es mit anderen Start- oder Zielorten.
            </p>
            <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Neue Suche starten
            </Link>
          </div>
        )}
        
        {/* Zurück-Button */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Zurück zur Startseite
          </Link>
        </div>
      </div>

      {/* Bestätigungsmodal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white rounded-lg max-w-lg w-full mx-4 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Umzugsfirma auswählen
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Möchten Sie die folgende Umzugsfirma auswählen?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900">{selectedCompany.companyName}</h4>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span className="font-medium text-blue-600">{selectedCompany.averageRating.toFixed(1)}</span>
                  <span className="mx-1">•</span>
                  <span>{selectedCompany.reviewsCount} Bewertungen</span>
                  {selectedCompany.isKisteKlarCertified && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-green-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        KisteKlar zertifiziert
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Geschätzter Preis:</span>
                  <span className="text-xl font-bold text-blue-700">
                    {formData ? (selectedCompany.hourlyRate * formData.helpersCount * formData.estimatedHours) : 0} €
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Basierend auf {formData?.helpersCount || 2} Helfern für {formData?.estimatedHours || 4} Stunden
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Auswählen und fortfahren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}