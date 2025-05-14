// src/components/ui/CompanyCard.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from './StarRating';
import styles from '@/app/styles/Components.module.css';

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
    <div className={styles.companyCard}>
      <div className={styles.companyCardBody}>
        <div className={styles.companyHeader}>
          <div className={styles.companyInfo}>
            {/* Firmenlogo */}
            <div className={styles.companyLogo}>
              {company.logo ? (
                <Image 
                  src={company.logo} 
                  alt={`${company.companyName} Logo`}
                  width={64}
                  height={64}
                  className="object-cover" 
                />
              ) : (
                <div className={styles.logoPlaceholder}>
                  {company.companyName.charAt(0)}
                </div>
              )}
            </div>

            <div className={styles.companyDetails}>
              <h3 className={styles.companyName}>{company.companyName}</h3>
              <div className={styles.ratingContainer}>
                <StarRating rating={company.averageRating} />
                <span className={styles.reviewCount}>
                  ({company.reviewsCount} {company.reviewsCount === 1 ? 'Bewertung' : 'Bewertungen'})
                </span>
              </div>
              
              {/* KisteKlar Zertifikat */}
              {company.isKisteKlarCertified && (
                <div className={`${styles.badge} ${styles.badgeGreen}`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={styles.certifiedIcon}
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  KisteKlar Zertifiziert
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preis */}
        <div className={styles.priceSection}>
          <div className={styles.priceHeader}>
            <span className={styles.priceLabel}>Stundensatz:</span>
            <span className={styles.priceValue}>{estimatedPrice} €/Std</span>
          </div>
          <p className={styles.priceInfo}>
            für 2 Helfer (50 € pro Helfer/Std)
          </p>
        </div>

        {/* Zusätzliche Informationen (Ausklappbar) */}
        <div className={`${styles.companyDetails} ${expanded ? styles.expanded : styles.collapsed}`}>
          {expanded && (
            <>
              <div className={styles.companySection}>
                <h4 className={styles.sectionTitle}>Beschreibung</h4>
                <p className={styles.companyDescription}>
                  {company.description || 'Keine Beschreibung verfügbar.'}
                </p>
              </div>

              <div className={styles.companySection}>
                <h4 className={styles.sectionTitle}>Servicegebiete</h4>
                <div className={styles.serviceAreas}>
                  {company.serviceAreas && company.serviceAreas.length > 0 ? (
                    company.serviceAreas.map((area, index) => (
                      <span key={index} className={styles.serviceArea}>
                        {area.from} → {area.to}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noServiceAreas}>Keine Servicegebiete angegeben.</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Aktionsbuttons */}
        <div className={styles.companyActions}>
          <button
            type="button"
            onClick={toggleExpand}
            className={`${styles.btn} ${styles.btnOutline}`}
          >
            {expanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
          </button>
          
          <button
            type="button"
            onClick={() => onSelect(company)}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Auswählen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;