// src/app/(auth)/register/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/Components.module.css';

const RegisterPage = () => {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user', // Standard: normaler Benutzer
    terms: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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
    
    if (!formData.name) {
      newErrors.name = 'Name ist erforderlich';
    }
    
    if (!formData.email) {
      newErrors.email = 'E-Mail-Adresse ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-Mail-Adresse ist ungültig';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Telefonnummer ist erforderlich';
    }
    
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'Sie müssen den Nutzungsbedingungen zustimmen';
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
    setRegisterError(null);
    
    // Passwort-Bestätigung aus Daten entfernen vor dem Senden
    const { confirmPassword, terms, ...registrationData } = formData;
    
    try {
      const result = await register(registrationData);
      
      if (result.success) {
        // Weiterleitung zum Dashboard
        router.push(formData.role === 'user' ? '/user' : '/company/setup');
      } else {
        setRegisterError(result.message || 'Registrierung fehlgeschlagen');
      }
    } catch (error) {
      setRegisterError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container py-8">
      <div className={styles.authForm}>
        <h1 className={styles.authTitle}>Registrierung</h1>
        <p className={styles.authDescription}>Erstellen Sie ein Konto, um Pack & Go zu verwenden.</p>
        
        {registerError && (
          <div className={`${styles.alert} ${styles.alertDanger}`}>
            <div className={styles.alertIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p>{registerError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formField}>
            <label htmlFor="name" className={styles.formLabel}>Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.name ? styles.formInputError : ''}`}
              placeholder="Vor- und Nachname"
              disabled={isSubmitting}
            />
            {errors.name && <p className={styles.formError}>{errors.name}</p>}
          </div>
          
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
            <label htmlFor="phone" className={styles.formLabel}>Telefonnummer</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
              placeholder="+49 123 4567890"
              disabled={isSubmitting}
            />
            {errors.phone && <p className={styles.formError}>{errors.phone}</p>}
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
              placeholder="Mindestens 6 Zeichen"
              disabled={isSubmitting}
            />
            {errors.password && <p className={styles.formError}>{errors.password}</p>}
          </div>
          
          <div className={styles.formField}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>Passwort bestätigen</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.confirmPassword ? styles.formInputError : ''}`}
              placeholder="Passwort wiederholen"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <p className={styles.formError}>{errors.confirmPassword}</p>}
          </div>
          
          <div className={styles.formField}>
            <label htmlFor="role" className={styles.formLabel}>Konto-Typ</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.formInput}
              disabled={isSubmitting}
            >
              <option value="user">Kunde</option>
              <option value="company">Umzugsunternehmen</option>
            </select>
          </div>
          
          <div className={styles.formCheckbox}>
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className={styles.checkboxInput}
              disabled={isSubmitting}
            />
            <label htmlFor="terms" className={styles.checkboxLabel}>
              Ich stimme den <Link href="/terms" target="_blank" className={styles.formFooterLink}>Nutzungsbedingungen</Link> und der <Link href="/privacy" target="_blank" className={styles.formFooterLink}>Datenschutzerklärung</Link> zu.
            </label>
          </div>
          {errors.terms && <p className={styles.formError}>{errors.terms}</p>}
          
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Registrierung...' : 'Registrieren'}
          </button>
        </form>
        
        <div className={styles.formFooter}>
          <p>
            Bereits registriert? 
            <Link href="/login" className={styles.formFooterLink}> Jetzt anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;