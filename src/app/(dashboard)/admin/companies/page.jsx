'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from '@/components/ui/Image';
import styles from '@/app/styles/UserDashboard.module.css';

export default function AdminCompaniesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Lade Companies beim Mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Filtere Companies basierend auf Status und Search
  useEffect(() => {
    let filtered = companies;

    // Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(company => !company.isVerified);
      } else if (statusFilter === 'verified') {
        filtered = filtered.filter(company => company.isVerified);
      } else if (statusFilter === 'kisteklar') {
        filtered = filtered.filter(company => company.isKisteKlarCertified);
      }
    }

    // Search Filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.taxId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
  }, [companies, statusFilter, searchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/companies');
      const data = await response.json();

      if (data.success) {
        setCompanies(data.companies);
      } else {
        setError(data.message || 'Fehler beim Laden der Unternehmen');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Unternehmen:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyAction = async (companyId, action) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        // Aktualisiere die Company in der Liste
        setCompanies(companies.map(company => 
          company._id === companyId 
            ? { ...company, isVerified: action === 'verify' }
            : company
        ));
        
        // Schließe Modal wenn es offen ist
        if (showModal) {
          setShowModal(false);
          setSelectedCompany(null);
        }
      } else {
        setError(data.message || `Fehler beim ${action === 'verify' ? 'Verifizieren' : 'Ablehnen'} des Unternehmens`);
      }
    } catch (error) {
      console.error('Fehler bei Company-Aktion:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nicht verfügbar';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };

  const getStatusBadge = (company) => {
    if (company.isVerified) {
      return <span className={`${styles.statusBadge} ${styles.statusverified}`}>Verifiziert</span>;
    } else {
      return <span className={`${styles.statusBadge} ${styles.statuspending}`}>Ausstehend</span>;
    }
  };

  const getStats = () => {
    const verified = companies.filter(c => c.isVerified).length;
    const pending = companies.filter(c => !c.isVerified).length;
    const kisteklar = companies.filter(c => c.isKisteKlarCertified).length;

    return { total: companies.length, verified, pending, kisteklar };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade Unternehmen...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Unternehmensverwaltung</h1>
        <p className={styles.welcomeMessage}>
          Verwalten Sie alle registrierten Umzugsunternehmen
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={`${styles.errorMessage} ${styles.bgRed50}`}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <svg className={styles.textRed400} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={styles.errorText}>
              <h3 className={styles.errorTitle}>Fehler</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Gesamt</h3>
            <p className={styles.statValue}>{stats.total}</p>
            <p className={styles.statDescription}>Registrierte Unternehmen</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Verifiziert</h3>
            <p className={styles.statValue}>{stats.verified}</p>
            <p className={styles.statDescription}>Aktive Unternehmen</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Ausstehend</h3>
            <p className={styles.statValue}>{stats.pending}</p>
            <p className={styles.statDescription}>Warten auf Verifizierung</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>KisteKlar</h3>
            <p className={styles.statValue}>{stats.kisteklar}</p>
            <p className={styles.statDescription}>Zertifizierte Unternehmen</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Filter & Suche</h2>
        </div>
        
        <div className={styles.filterContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="statusFilter" className={styles.filterLabel}>Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Alle</option>
              <option value="pending">Ausstehend</option>
              <option value="verified">Verifiziert</option>
              <option value="kisteklar">KisteKlar Zertifiziert</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="searchTerm" className={styles.filterLabel}>Suche:</label>
            <input
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Firmenname, Stadt oder Steuernummer..."
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Unternehmen ({filteredCompanies.length})
          </h2>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Keine Unternehmen gefunden</h3>
            <p className={styles.emptyDescription}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Keine Unternehmen entsprechen den aktuellen Filterkriterien.'
                : 'Es sind noch keine Unternehmen registriert.'
              }
            </p>
          </div>
        ) : (
          <div className={styles.companiesGrid}>
            {filteredCompanies.map((company) => (
              <div key={company._id} className={styles.companyCard}>
                <div className={styles.companyHeader}>
                  <div className={styles.companyInfo}>
                    <div className={styles.companyLogo}>
                      {company.logo ? (
                        <Image 
                          src={company.logo} 
                          alt={company.companyName}
                          width={48}
                          height={48}
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
                      <p className={styles.companyLocation}>
                        {company.address?.city}, {company.address?.country}
                      </p>
                      <div className={styles.companyMeta}>
                        <span className={styles.taxId}>Steuernr: {company.taxId}</span>
                        <span className={styles.hourlyRate}>{company.hourlyRate}€/Std</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.companyStatus}>
                    {getStatusBadge(company)}
                    {company.isKisteKlarCertified && (
                      <span className={`${styles.statusBadge} ${styles.statuskisteklar}`}>
                        KisteKlar
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.companyStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Bewertung:</span>
                    <span className={styles.statValue}>
                      {company.averageRating.toFixed(1)} ({company.reviewsCount})
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Registriert:</span>
                    <span className={styles.statValue}>
                      {formatDate(company.createdAt)}
                    </span>
                  </div>
                </div>

                <div className={styles.companyActions}>
                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowModal(true);
                    }}
                    className={styles.detailsButton}
                  >
                    Details anzeigen
                  </button>
                  
                  {!company.isVerified ? (
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleCompanyAction(company._id, 'verify')}
                        disabled={actionLoading}
                        className={styles.verifyButton}
                      >
                        {actionLoading ? 'Verarbeitung...' : 'Verifizieren'}
                      </button>
                      <button
                        onClick={() => handleCompanyAction(company._id, 'reject')}
                        disabled={actionLoading}
                        className={styles.rejectButton}
                      >
                        {actionLoading ? 'Verarbeitung...' : 'Ablehnen'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompanyAction(company._id, 'unverify')}
                      disabled={actionLoading}
                      className={styles.unverifyButton}
                    >
                      {actionLoading ? 'Verarbeitung...' : 'Verifizierung entziehen'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      {showModal && selectedCompany && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Unternehmensdetails: {selectedCompany.companyName}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCompany(null);
                }}
                className={styles.modalCloseButton}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Company Info */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Allgemeine Informationen</h4>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Firmenname:</span>
                    <span className={styles.modalValue}>{selectedCompany.companyName}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Steuernummer:</span>
                    <span className={styles.modalValue}>{selectedCompany.taxId}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Stundensatz:</span>
                    <span className={styles.modalValue}>{selectedCompany.hourlyRate}€ pro Helfer</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Status:</span>
                    <span className={styles.modalValue}>
                      {selectedCompany.isVerified ? 'Verifiziert' : 'Ausstehend'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Adresse</h4>
                <div className={styles.modalAddress}>
                  <p>{selectedCompany.address?.street}</p>
                  <p>{selectedCompany.address?.postalCode} {selectedCompany.address?.city}</p>
                  <p>{selectedCompany.address?.country}</p>
                </div>
              </div>

              {/* Description */}
              {selectedCompany.description && (
                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Beschreibung</h4>
                  <p className={styles.modalDescription}>{selectedCompany.description}</p>
                </div>
              )}

              {/* Service Areas */}
              {selectedCompany.serviceAreas && selectedCompany.serviceAreas.length > 0 && (
                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Servicegebiete</h4>
                  <div className={styles.serviceAreasList}>
                    {selectedCompany.serviceAreas.map((area, index) => (
                      <span key={index} className={styles.serviceArea}>
                        {area.from} → {area.to}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Dokumente</h4>
                <div className={styles.documentsList}>
                  {selectedCompany.documents?.businessLicense?.url && (
                    <div className={styles.documentItem}>
                      <span className={styles.documentLabel}>Betriebsausweis:</span>
                      <a 
                        href={selectedCompany.documents.businessLicense.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.documentLink}
                      >
                        Dokument anzeigen
                      </a>
                    </div>
                  )}
                  {selectedCompany.documents?.kisteKlarCertificate?.url && (
                    <div className={styles.documentItem}>
                      <span className={styles.documentLabel}>KisteKlar-Zertifikat:</span>
                      <a 
                        href={selectedCompany.documents.kisteKlarCertificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.documentLink}
                      >
                        Dokument anzeigen
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Statistiken</h4>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Durchschnittliche Bewertung:</span>
                    <span className={styles.modalValue}>
                      {selectedCompany.averageRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Anzahl Bewertungen:</span>
                    <span className={styles.modalValue}>{selectedCompany.reviewsCount}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Registrierungsdatum:</span>
                    <span className={styles.modalValue}>
                      {formatDate(selectedCompany.createdAt)}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>KisteKlar-Zertifikat:</span>
                    <span className={styles.modalValue}>
                      {selectedCompany.isKisteKlarCertified ? 'Ja' : 'Nein'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCompany(null);
                }}
                className={styles.modalSecondaryButton}
              >
                Schließen
              </button>
              
              {!selectedCompany.isVerified ? (
                <div className={styles.modalActionButtons}>
                  <button
                    onClick={() => handleCompanyAction(selectedCompany._id, 'verify')}
                    disabled={actionLoading}
                    className={styles.modalVerifyButton}
                  >
                    {actionLoading ? 'Verarbeitung...' : 'Verifizieren'}
                  </button>
                  <button
                    onClick={() => handleCompanyAction(selectedCompany._id, 'reject')}
                    disabled={actionLoading}
                    className={styles.modalRejectButton}
                  >
                    {actionLoading ? 'Verarbeitung...' : 'Ablehnen'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleCompanyAction(selectedCompany._id, 'unverify')}
                  disabled={actionLoading}
                  className={styles.modalUnverifyButton}
                >
                  {actionLoading ? 'Verarbeitung...' : 'Verifizierung entziehen'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}