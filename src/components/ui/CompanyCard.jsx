// src/components/ui/CompanyCard.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StarRating from "./StarRating";

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
    <div>
      <div>
        <div>
          <div>
            {/* Firmenlogo */}
            <div>
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={`${company.companyName} Logo`}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div>{company.companyName.charAt(0)}</div>
              )}
            </div>

            <div>
              <h3>{company.companyName}</h3>
              <div>
                <StarRating rating={company.averageRating} />
                <span>
                  ({company.reviewsCount}{" "}
                  {company.reviewsCount === 1 ? "Bewertung" : "Bewertungen"})
                </span>
              </div>

              {/* KisteKlar Zertifikat */}
              {company.isKisteKlarCertified && (
                <div className={`${styles.badge} ${styles.badgeGreen}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
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
        <div>
          <div>
            <span>Stundensatz:</span>
            <span>{estimatedPrice} €/Std</span>
          </div>
          <p>für 2 Helfer (50 € pro Helfer/Std)</p>
        </div>

        {/* Zusätzliche Informationen (Ausklappbar) */}
        <div
          className={`${styles.companyDetails} ${expanded ? styles.expanded : styles.collapsed}`}
        >
          {expanded && (
            <>
              <div>
                <h4>Beschreibung</h4>
                <p>{company.description || "Keine Beschreibung verfügbar."}</p>
              </div>

              <div>
                <h4>Servicegebiete</h4>
                <div>
                  {company.serviceAreas && company.serviceAreas.length > 0 ? (
                    company.serviceAreas.map((area, index) => (
                      <span key={index}>
                        {area.from} → {area.to}
                      </span>
                    ))
                  ) : (
                    <span>Keine Servicegebiete angegeben.</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Aktionsbuttons */}
        <div>
          <button
            type="button"
            onClick={toggleExpand}
            className={`${styles.btn} ${styles.btnOutline}`}
          >
            {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
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
