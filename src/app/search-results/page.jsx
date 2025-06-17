// src/app/search-results/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/ui/Image';
import styles from '@/app/styles/SearchResults.module.css';

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

  // Handle customer service contact
  const handleContactCustomerService = () => {
    // Can navigate to customer service page, open chat window, or show contact info
    // Here are some implementation examples:
    
    // Option 1: Navigate to customer service page
    // router.push('/customer-service');
    router.push('/contact');
    
    // Option 2: Open external customer service link
    // window.open('https://your-customer-service-url.com', '_blank');
    
    // Option 3: Show contact information
    // alert('Customer service contact:\nPhone: +49-xxx-xxx-xxxx\nEmail: support@example.com\nLive chat: Coming soon');
    
    // Option 4: Open live chat (if integrated)
    // if (window.Intercom) {
    //   window.Intercom('show');
    // }
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
    // Clear search data
    sessionStorage.removeItem('movingFormData');
    sessionStorage.removeItem('searchResults');
    sessionStorage.removeItem('searchSummary');
    router.push('/');
  };

  // Render search summary component
  const renderSearchSummary = () => {
    if (!searchSummary) return null;

    const { searchType, fromCity, toCity, totalFound, hasExactMatches, hasKisteKlarCertified } = searchSummary;
    
    return (
      <div className={styles.searchSummary}>
        <div className={styles.searchSummaryHeader}>
          <h3 className={styles.searchSummaryTitle}>Search Details</h3>
        </div>
        
        <div className={styles.searchSummaryContent}>
          <div className={styles.searchTypeInfo}>
            {searchType === 'same-city' ? (
              <div className={styles.searchTypeItem}>
                <span className={styles.searchTypeIcon}>🏙️</span>
                <span className={styles.searchTypeText}>
                  <strong>Same-city move</strong>: {fromCity}
                </span>
              </div>
            ) : (
              <div className={styles.searchTypeItem}>
                <span className={styles.searchTypeIcon}>🚛</span>
                <span className={styles.searchTypeText}>
                  <strong>Cross-city move</strong>: {fromCity} → {toCity}
                </span>
              </div>
            )}
          </div>

          <div className={styles.searchResults}>
            {totalFound > 0 ? (
              <div className={styles.searchResultsPositive}>
                {hasExactMatches ? (
                  <div className={styles.matchInfo}>
                    <span className={styles.matchIcon}>✅</span>
                    <span className={styles.matchText}>
                      Found <strong>{totalFound}</strong> matching moving companies, including exact routes
                    </span>
                  </div>
                ) : (
                  <div className={styles.matchInfoContainer}>
                    <div className={styles.matchInfo}>
                      <span className={styles.matchIcon}>⚠️</span>
                      <span className={styles.matchText}>
                        Found <strong>{totalFound}</strong> moving companies, no exact matches found, using relaxed criteria
                      </span>
                    </div>
                    <div className={styles.customerServiceSuggestion}>
                      <span className={styles.suggestionIcon}>💬</span>
                      <span className={styles.suggestionText}>
                        Need more precise matches?
                        <button 
                          className={styles.customerServiceLink}
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
                  <div className={styles.certifiedInfo}>
                    <span className={styles.certifiedIcon}>🏆</span>
                    <span className={styles.certifiedText}>
                      Includes KisteKlar certified moving companies
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.searchResultsNegative}>
                <span className={styles.noResultsIcon}>❌</span>
                <span className={styles.noResultsText}>
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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <h2 className={styles.loadingText}>Searching for moving companies...</h2>
        <p className={styles.loadingSubtext}>Please wait a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Error occurred</h2>
          <p className={styles.errorText}>{error}</p>
          <button 
            className={styles.primaryButton}
            onClick={() => router.push('/')}
          >
            Return to homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.searchResultsContainer}>
      {/* Header Section */}
      <div className={styles.searchResultsHeader}>
        <h1 className={styles.title}>Moving Companies Search Results</h1>
        <p className={styles.subtitle}>
          From {formData?.fromAddress?.city || 'origin'} to {formData?.toAddress?.city || 'destination'}
        </p>
      </div>

      {/* Search Summary */}
      {renderSearchSummary()}

      {companies.length > 0 ? (
        <>
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.resultsCount}>
              <h2 className={styles.resultsText}>
                Found {companies.length} moving companies
              </h2>
              <p className={styles.resultsSubtext}>
                Estimated {formData?.estimatedHours || 4} hours, {formData?.helpersCount || 2} movers
              </p>
            </div>
            
            <div className={styles.sortContainer}>
              <span className={styles.sortLabel}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="rating">Highest rating</option>
                <option value="certified">KisteKlar certified</option>
                <option value="match">Best match</option>
              </select>
            </div>
          </div>

          {/* Companies List */}
          <div className={styles.companiesList}>
            {sortedCompanies.map((company) => (
              <div key={company._id} className={styles.companyCard}>
                <div className={styles.companyHeader}>
                  <div className={styles.companyInfo}>
                    <div className={styles.companyLogo}>
                      {company.logo ? (
                        <Image 
                          src={company.logo} 
                          alt={`${company.companyName} Logo`}
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
                      <h3 className={styles.companyName}>{company.companyName}</h3>
                      <div className={styles.ratingContainer}>
                        <div className={styles.stars}>
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={i < Math.round(company.averageRating) ? styles.starFilled : styles.starEmpty}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className={styles.reviewCount}>
                          ({company.reviewsCount} reviews)
                        </span>
                      </div>
                      
                      {/* Match type display */}
                      {company.matchType && (
                        <div className={styles.matchTypeBadge}>
                          <span className={styles.matchTypeText}>{company.matchType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {company.isKisteKlarCertified && (
                    <div className={styles.certificationBadge}>
                      <svg className={styles.certIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      KisteKlar Certified
                    </div>
                  )}
                </div>
                
                {/* Company details section */}
                <div className={styles.companyDetailsSection}>
                  {company.description && (
                    <div className={styles.descriptionSection}>
                      <h4 className={styles.sectionTitle}>Company Description</h4>
                      <p className={styles.companyDescription}>{company.description}</p>
                    </div>
                  )}
                  
                  {company.serviceAreas && company.serviceAreas.length > 0 && (
                    <div className={styles.serviceAreasSection}>
                      <h4 className={styles.sectionTitle}>Service Areas</h4>
                      <div className={styles.serviceAreasList}>
                        {company.serviceAreas.map((area, areaIndex) => (
                          <span key={areaIndex} className={styles.serviceAreaTag}>
                            {area.from} → {area.to}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* <div className={styles.priceSection}>
                    <h4 className={styles.sectionTitle}>Pricing</h4>
                    <div className={styles.priceInfo}>
                      <span className={styles.hourlyRate}>€{company.hourlyRate}/hour/person</span>
                      <span className={styles.estimatedTotal}>
                        Estimated total: €{formData ? (company.hourlyRate * formData.helpersCount * formData.estimatedHours) : 0}
                      </span>
                    </div>
                  </div> */}
                </div>
                
                {/* Action button */}
                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    className={styles.primaryButton}
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
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>😔</div>
          <h3 className={styles.noResultsTitle}>No matching moving companies found</h3>
          <p className={styles.noResultsText}>
            Sorry, we couldn't find any moving companies matching your search criteria.
          </p>
          <div className={styles.noResultsSuggestions}>
            <h4 className={styles.suggestionsTitle}>Suggestions:</h4>
            <ul className={styles.suggestionsList}>
              <li>Try searching nearby cities</li>
              <li>Check if city names are correct</li>
              <li>Contact our customer service for recommendations</li>
            </ul>
          </div>
          <div className={styles.noResultsActions}>
            <button
              className={styles.primaryButton}
              onClick={handleNewSearch}
            >
              Search again
            </button>
            <button
              className={styles.secondaryButton}
              onClick={handleContactCustomerService}
            >
              Contact Customer Service
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.backButtonContainer}>
        <button 
          onClick={handleNewSearch}
          className={styles.backButton}
        >
          <svg className={styles.backIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.70711 14.7071C7.31658 15.0976 6.68342 15.0976 6.29289 14.7071L2.29289 10.7071C1.90237 10.3166 1.90237 9.68342 2.29289 9.29289L6.29289 5.29289C6.68342 4.90237 7.31658 4.90237 7.70711 5.29289C8.09763 5.68342 8.09763 6.31658 7.70711 6.70711L5.41421 9H17C17.5523 9 18 9.44772 18 10C18 10.5523 17.5523 11 17 11H5.41421L7.70711 13.2929C8.09763 13.6834 8.09763 14.3166 7.70711 14.7071Z" fill="currentColor"/>
          </svg>
          Back to homepage
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedCompany && (
        <div className={styles.modalBackdrop} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm Moving Company Selection</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Are you sure you want to select this moving company?
              </p>
              <div className={styles.modalCompanyCard}>
                <h4 className={styles.modalCompanyName}>{selectedCompany.companyName}</h4>
                <div className={styles.modalCompanyDetails}>
                  <div className={styles.modalRating}>
                    <span className={styles.modalRatingValue}>{selectedCompany.averageRating.toFixed(1)}</span>
                    <span className={styles.modalRatingSeparator}>•</span>
                    <span className={styles.modalReviewCount}>{selectedCompany.reviewsCount} reviews</span>
                    {selectedCompany.isKisteKlarCertified && (
                      <>
                        <span className={styles.modalRatingSeparator}>•</span>
                        <span className={styles.modalCertified}>
                          <svg className={styles.modalCertIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          KisteKlar Certified
                        </span>
                      </>
                    )}
                  </div>
                  {selectedCompany.matchType && (
                    <div className={styles.modalMatchType}>
                      Match Type: {selectedCompany.matchType}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.modalPriceCard}>
                <div className={styles.modalPriceHeader}>
                  <span className={styles.modalPriceLabel}>Estimated Price: </span>
                  <span className={styles.modalPriceValue}>
                    €{formData ? (selectedCompany.hourlyRate * formData.helpersCount * formData.estimatedHours) : 0}
                  </span>
                </div>
                <p className={styles.modalPriceNote}>
                  Based on {formData?.helpersCount || 2} movers, working for {formData?.estimatedHours || 4} hours
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={styles.modalSecondaryButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSelection}
                className={styles.modalPrimaryButton}
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