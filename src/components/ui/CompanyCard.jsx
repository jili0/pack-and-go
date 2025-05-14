// src/components/ui/CompanyCard.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from './StarRating';

const CompanyCard = ({ company, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Berechne den Preis basierend auf dem Stundensatz und 2 Helfern (Standardwert)
  const hourlyRate = company.hourlyRate || 50;
  const helpersCount = 2;
  const estimatedPrice = hourlyRate * helpersCount;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all hover:shadow-lg">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Firmenlogo */}
            <div className="w-16 h-16 relative bg-gray-100 rounded-full flex-shrink-0 overflow-hidden">
              {company.logo ? (
                <Image 
                  src={company.logo} 
                  alt={`${company.companyName} Logo`}
                  fill
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                    />
                  </svg>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">{company.companyName}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <StarRating rating={company.averageRating} />
                <span className="text-gray-600 text-sm">
                  ({company.reviewsCount} {company.reviewsCount === 1 ? 'Bewertung' : 'Bewertungen'})
                </span>
              </div>
            </div>
          </div>

          {/* KisteKlar Zertifikat */}
          {company.isKisteKlarCertified && (
            <div className="flex-shrink-0">
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                KisteKlar Zertifiziert
              </div>
            </div>
          )}
        </div>

        {/* Preis */}
        <div className="mt-4 bg-blue-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Stundensatz:</span>
            <span className="text-xl font-bold text-blue-700">{estimatedPrice} €/Std</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            für 2 Helfer (50 € pro Helfer/Std)
          </p>
        </div>

        {/* Zusätzliche Informationen (Ausklappbar) */}
        <div className={`mt-4 overflow-hidden transition-all ${expanded ? 'max-h-96' : 'max-h-0'}`}>
          {expanded && (
            <>
              <div className="py-2 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Beschreibung</h4>
                <p className="text-sm text-gray-600 break-words">
                  {company.description || 'Keine Beschreibung verfügbar.'}
                </p>
              </div>

              <div className="py-2 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Servicegebiete</h4>
                <div className="flex flex-wrap gap-2">
                  {company.serviceAreas && company.serviceAreas.length > 0 ? (
                    company.serviceAreas.map((area, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                        {area.from} → {area.to}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-600">Keine Servicegebiete angegeben.</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Aktionsbuttons */}
        <div className="mt-5 flex flex-col sm:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={toggleExpand}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {expanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
          </button>
          
          <button
            type="button"
            onClick={() => onSelect(company)}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Auswählen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;