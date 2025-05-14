// src/app/contact/page.jsx
'use client';

import { useState } from 'react';
import styles from '@/app/styles/Contact.module.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Fehler löschen beim Tippen
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail-Adresse ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-Mail-Adresse ist ungültig';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Bitte geben Sie eine Nachricht ein';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitResult({
          success: true,
          message: 'Vielen Dank für Ihre Nachricht! Wir werden uns so schnell wie möglich bei Ihnen melden.'
        });
        // Form nur bei Erfolg zurücksetzen
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitResult({
          success: false,
          message: data.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
        });
      }
    } catch (error) {
      console.error('Fehler beim Senden des Kontaktformulars:', error);
      setSubmitResult({
        success: false,
        message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.contactHero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Kontaktieren Sie uns</h1>
          <p className={styles.heroSubtitle}>Haben Sie Fragen oder Anregungen? Unser Team steht Ihnen gerne zur Verfügung.</p>
        </div>
      </div>
      
      <div className={styles.contactContent}>
        <div className="container">
          <div className={styles.contactGrid}>
            <div className={styles.formColumn}>
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Senden Sie uns eine Nachricht</h2>
                <p className={styles.formSubtitle}>Wir freuen uns, von Ihnen zu hören und antworten innerhalb von 24 Stunden.</p>
                
                {submitResult && (
                  submitResult.success ? (
                    <div className={styles.successAlert}>
                      <div className={styles.successIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <div>
                        <h3 className={styles.successTitle}>Nachricht gesendet!</h3>
                        <div className={styles.successMessage}>
                          <p>{submitResult.message}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.errorAlert}>
                      <div className={styles.errorIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <div>
                        <h3 className={styles.errorTitle}>Fehler</h3>
                        <div className={styles.errorMessage}>
                          <p>{submitResult.message}</p>
                        </div>
                      </div>
                    </div>
                  )
                )}
                
                <form className={styles.contactForm} onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name" className={styles.formLabel}>Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                        placeholder="Ihr Name"
                        disabled={isSubmitting}
                      />
                      {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>E-Mail</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                        placeholder="ihre-email@example.com"
                        disabled={isSubmitting}
                      />
                      {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="subject" className={styles.formLabel}>Betreff</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Worum geht es?"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.formLabel}>Nachricht</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`${styles.formTextarea} ${errors.message ? styles.inputError : ''}`}
                      placeholder="Wie können wir Ihnen helfen?"
                      rows="6"
                      disabled={isSubmitting}
                    ></textarea>
                    {errors.message && <p className={styles.errorText}>{errors.message}</p>}
                  </div>
                  
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
                  </button>
                </form>
              </div>
            </div>
            
            <div className={styles.infoColumn}>
              {/* Kontaktinformationen - du kannst diesen Teil nach Bedarf anpassen */}
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Kontaktinformationen</h3>
                <div className={styles.contactInfo}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.infoLabel}>E-Mail</h4>
                      <p className={styles.infoText}>info@pack-and-go.de</p>
                      <p className={styles.infoSubtext}>Wir antworten innerhalb von 24 Stunden</p>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.infoLabel}>Telefon</h4>
                      <p className={styles.infoText}>+49 (0) 30 1234567</p>
                      <p className={styles.infoSubtext}>Mo-Fr von 9:00 bis 17:00 Uhr</p>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.infoLabel}>Adresse</h4>
                      <p className={styles.infoText}>Musterstraße 123</p>
                      <p className={styles.infoText}>10115 Berlin</p>
                    </div>
                  </div>
                </div>
                
                <div className={styles.socialLinks}>
                  <h4 className={styles.socialTitle}>Folgen Sie uns</h4>
                  <div className={styles.socialIcons}>
                    <a href="#" className={styles.socialIcon} aria-label="Facebook">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a href="#" className={styles.socialIcon} aria-label="Twitter">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                    </a>
                    <a href="#" className={styles.socialIcon} aria-label="Instagram">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className={styles.mapCard}>
                <h3 className={styles.mapTitle}>Unsere Standorte</h3>
                <div className={styles.mapContainer}>
                  <img src="/images/placeholder.jpg" alt="Karte mit Standort von Pack & Go" className={styles.mapImage} />
                </div>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                  Auf Google Maps anzeigen →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;