// src/app/(auth)/login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/Components.module.css';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Fehler beim Tippen löschen
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'E-Mail-Adresse ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-Mail-Adresse ist ungültig';
    }
    
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
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
    setLoginError(null);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Weiterleitung zur vorherigen Seite oder zum Dashboard
        const fromUrl = searchParams.get('from');
        router.push(fromUrl || '/user');
      } else {
        setLoginError(result.message || 'Anmeldung fehlgeschlagen');
      }
    } catch (error) {
      setLoginError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container py-8">
      <div className={styles.authForm}>
        <h1 className={styles.authTitle}>Willkommen zurück</h1>
        <p className={styles.authDescription}>Melden Sie sich an, um Ihren Umzug zu planen oder zu verwalten.</p>
        
        {loginError && (
          <div className={`${styles.alert} ${styles.alertDanger}`}>
            <div className={styles.alertIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p>{loginError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formField}>
            <label htmlFor="email" className={styles.formLabel}>E-Mail-Adresse</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
              placeholder="beispiel@email.de"
              disabled={isSubmitting}
            />
            {errors.email && <p className={styles.formError}>{errors.email}</p>}
          </div>
          
          <div className={styles.formField}>
            <label htmlFor="password" className={styles.formLabel}>Passwort</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.password ? styles.formInputError : ''}`}
              placeholder="Ihr Passwort"
              disabled={isSubmitting}
            />
            {errors.password && <p className={styles.formError}>{errors.password}</p>}
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Anmeldung...' : 'Anmelden'}
          </button>
        </form>
        
        <div className={styles.formFooter}>
          <p>
            Noch kein Konto? 
            <Link href="/register" className={styles.formFooterLink}> Jetzt registrieren</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;