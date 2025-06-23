// src/app/search-results/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/ui/Image';
import "@/app/styles/styles.css";
// import styles from '@/app/styles/SearchResults.module.css';

export default function SearchResults() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('rating');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadSessionData = () => {
      try {
        if (typeof window === 'undefined') {
          setError('Page not ready, please refresh.');
          setLoading(false);
          return;
        }

        const savedFormData = sessionStorage.getItem('movingFormData');
        const savedResults = sessionStorage.getItem('searchResults');
        const savedSearchSummary = sessionStorage.getItem('searchSummary');
        
        if (!savedFormData || !savedResults) {
          router.push('/');
          return;
        }
        
        const parsedFormData = JSON.parse(savedFormData);
        const parsedResults = JSON.parse(savedResults);
        const parsedSearchSummary = savedSearchSummary ? JSON.parse(savedSearchSummary) : null;
        
        setFormData(parsedFormData);
        setCompanies(parsedResults);
        setSearchSummary(parsedSearchSummary);
        setLoading(false);
      } catch (error) {
        setError(`Failed to load search results: ${error.message}`);
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      loadSessionData();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const sortedCompanies = [...companies].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.averageRating - a.averageRating;
    } else if (sortBy === 'certified') {
      if (a.isKisteKlarCertified && !b.isKisteKlarCertified) return -1;
      if (!a.isKisteKlarCertified && b.isKisteKlarCertified) return 1;
      return b.averageRating - a.averageRating;
    } else if (sortBy === 'match') {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    return 0;
  });

  const handleContactCustomerService = () => {
    router.push('/contact');
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleConfirmSelection = () => {
    try {
      sessionStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
      router.push('/order/create');
    } catch (error) {
      setError(`Failed to save selection: ${error.message}`);
    }
  };

  const handleNewSearch = () => {
    sessionStorage.removeItem('movingFormData');
    sessionStorage.removeItem('searchResults');
    sessionStorage.removeItem('searchSummary');
    router.push('/');
  };

  const renderSearchSummary = () => {
    if (!searchSummary) return null;

    const { searchType, fromCity, toCity, totalFound, hasExactMatches, hasKisteKlarCertified } = searchSummary;
    
    return (
      <div className="search-summary">
        <div className="search-summary-header">
          <h3 className="search-summary-title">Search Details</h3>
        </div>
        
        <div className="search-summary-content">
          <div className="search-type-info">
            {searchType === 'same-city' ? (
              <div className="search-type-item">
                <span className="search-type-icon">🏙️</span>
                <span className="search-type-text">
                  <strong>Same-city move</strong>: {fromCity}
                </span>
              </div>
            ) : (
              <div className="search-type-item">
                <span className="search-type-icon">🚛</span>
                <span className="search-type-text">
                  <strong>Cross-city move</strong>: {fromCity} → {toCity}
                </span>
              </div>
            )}
          </div>

          <div className="search-results">
            {totalFound > 0 ? (
              <div className="search-results-positive">
                {hasExactMatches ? (
                  <div className="match-info">
                    <span className="match-icon">✅</span>
                    <span className="match-text">
                      Found <strong>{totalFound}</strong> matching moving companies, including exact routes
                    </span>
                  </div>
                ) : (
                  <div className="match-info-container">
                    <div className="match-info">
                      <span className="match-icon">⚠️</span>
                      <span className="match-text">
                        Found <strong>{totalFound}</strong> moving companies, no exact matches found, using relaxed criteria
                      </span>
                    </div>
                    <div className="customer-service-suggestion">
                      <span className="suggestion-icon">💬</span>
                      <span className="suggestion-text">
                        Need more precise matches?
                        <button 
                          className="customer-service-link"
                          onClick={handleContactCustomerService}
                          type="button"
                        >
                          Contact our customer service for recommendations
                        </button>
                      </span>
                    </div>
                  </div>
                )}
                
                {hasKisteKlarCertified && (
                  <div className="certified-info">
                    <span className="certified-icon">🏆</span>
                    <span className="certified-text">
                      Includes KisteKlar certified moving companies
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="search-results-negative">
                <span className="no-results-icon">❌</span>
                <span className="no-results-text">
                  No matching moving companies found, please try other cities or contact customer service
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2 className="loading-text">Searching for moving companies...</h2>
        <p className="loading-subtext">Please wait a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error occurred</h2>
          <p className="error-text">{error}</p>
          <button 
            className="primary-button"
            onClick={() => router.push('/')}
          >
            Return to homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      {/* Header Section */}
      <div className="search-results-header">
        <h1 className="title">Moving Companies Search Results</h1>
        <p className="subtitle">
          From {formData?.fromAddress?.city || 'origin'} to {formData?.toAddress?.city || 'destination'}
        </p>
      </div>

      {/* Search Summary */}
      {renderSearchSummary()}

      {companies.length > 0 ? (
        <>
          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="results-count">
              <h2 className="results-text">
                Found {companies.length} moving companies
              </h2>
              <p className="results-subtext">
                Estimated {formData?.estimatedHours || 4} hours, {formData?.helpersCount || 2} movers
              </p>
            </div>
            
            <div className="sort-container">
              <span className="sort-label">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                <option value="rating">Highest rating</option>
                <option value="certified">KisteKlar certified</option>
                <option value="match">Best match</option>
              </select>
            </div>
          </div>

          {/* Companies List */}
          <div className="companies-list">
            {sortedCompanies.map((company) => (
              <div key={company._id} className="company-card">
                <div className="company-header">
                  <div className="company-info">
                    <div className="company-logo">
                      {company.logo ? (
                        <Image 
                          src={company.logo} 
                          alt={`${company.companyName} Logo`}
                          width={64}
                          height={64}
                          className="logo-image" 
                        />
                      ) : (
                        <div className="logo-placeholder">
                          <span>{company.companyName.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="company-details">
                      <h3 className="company-name">{company.companyName}</h3>
                      <div className="rating-container">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={i < Math.round(company.averageRating) ? "star-filled" : "star-empty"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="review-count">
                          ({company.reviewsCount} reviews)
                        </span>
                      </div>
                      
                      {/* Match type display */}
                      {company.matchType && (
                        <div className="match-type-badge">
                          <span className="match-type-text">{company.matchType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {company.isKisteKlarCertified && (
                    <div className="certification-badge">
                      <svg className="cert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      KisteKlar Certified
                    </div>
                  )}
                </div>
                
                {/* Company details section */}
                <div className="company-details-section">
                  {company.description && (
                    <div className="description-section">
                      <h4 className="section-title">Company Description</h4>
                      <p className="company-description">{company.description}</p>
                    </div>
                  )}
                  
                  {company.serviceAreas && company.serviceAreas.length > 0 && (
                    <div className="service-areas-section">
                      <h4 className="section-title">Service Areas</h4>
                      <div className="service-areas-list">
                        {company.serviceAreas.map((area, areaIndex) => (
                          <span key={areaIndex} className="service-area-tag">
                            {area.from} → {area.to}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action button */}
                <div className="action-buttons">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => handleSelectCompany(company)}
                  >
                    Select this company
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* No Results */
        <div className="no-results">
          <div className="no-results-icon">😔</div>
          <h3 className="no-results-title">No matching moving companies found</h3>
          <p className="no-results-text">
            Sorry, we couldn't find any moving companies matching your search criteria.
          </p>
          <div className="no-results-suggestions">
            <h4 className="suggestions-title">Suggestions:</h4>
            <ul className="suggestions-list">
              <li>Try searching nearby cities</li>
              <li>Check if city names are correct</li>
              <li>Contact our customer service for recommendations</li>
            </ul>
          </div>
          <div className="no-results-actions">
            <button
              className="primary-button"
              onClick={handleNewSearch}
            >
              Search again
            </button>
            <button
              className="secondary-button"
              onClick={handleContactCustomerService}
            >
              Contact Customer Service
            </button>
          </div>
        </div>
      )}
      
      <div className="back-button-container">
        <button 
          onClick={handleNewSearch}
          className="back-button"
        >
          <svg className="back-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.70711 14.7071C7.31658 15.0976 6.68342 15.0976 6.29289 14.7071L2.29289 10.7071C1.90237 10.3166 1.90237 9.68342 2.29289 9.29289L6.29289 5.29289C6.68342 4.90237 7.31658 4.90237 7.70711 5.29289C8.09763 5.68342 8.09763 6.31658 7.70711 6.70711L5.41421 9H17C17.5523 9 18 9.44772 18 10C18 10.5523 17.5523 11 17 11H5.41421L7.70711 13.2929C8.09763 13.6834 8.09763 14.3166 7.70711 14.7071Z" fill="currentColor"/>
          </svg>
          Back to homepage
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedCompany && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Moving Company Selection</h3>
            </div>
            <div className="modal-body">
              <p className="modal-text">
                Are you sure you want to select this moving company?
              </p>
              <div className="modal-company-card">
                <h4 className="modal-company-name">{selectedCompany.companyName}</h4>
                <div className="modal-company-details">
                  <div className="modal-rating">
                    <span className="modal-rating-value">{selectedCompany.averageRating.toFixed(1)}</span>
                    <span className="modal-rating-separator">•</span>
                    <span className="modal-review-count">{selectedCompany.reviewsCount} reviews</span>
                    {selectedCompany.isKisteKlarCertified && (
                      <>
                        <span className="modal-rating-separator">•</span>
                        <span className="modal-certified">
                          <svg className="modal-cert-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          KisteKlar Certified
                        </span>
                      </>
                    )}
                  </div>
                  {selectedCompany.matchType && (
                    <div className="modal-match-type">
                      Match Type: {selectedCompany.matchType}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-price-card">
                <div className="modal-price-header">
                  <span className="modal-price-label">Estimated Price: </span>
                  <span className="modal-price-value">
                    €{formData ? (selectedCompany.hourlyRate * formData.helpersCount * formData.estimatedHours) : 0}
                  </span>
                </div>
                <p className="modal-price-note">
                  Based on {formData?.helpersCount || 2} movers, working for {formData?.estimatedHours || 4} hours
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="modal-secondary-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSelection}
                className="modal-primary-button"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}