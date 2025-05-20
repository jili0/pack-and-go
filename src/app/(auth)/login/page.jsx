'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/Components.module.css';

// Component for the content of the login form
const LoginContent = () => {
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
    // Clear errors when typing
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
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
        // Redirect to dashboard after login
        const fromUrl = searchParams.get('from');
        router.push(fromUrl || '/dashboard');
      } else {
        setLoginError(result.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.authForm}>
      <h1 className={styles.authTitle}>Welcome Back</h1>
      <p className={styles.authDescription}>Sign in to plan or manage your move.</p>
      
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
          <label htmlFor="email" className={styles.formLabel}>Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
            placeholder="example@email.com"
            disabled={isSubmitting}
          />
          {errors.email && <p className={styles.formError}>{errors.email}</p>}
        </div>
        
        <div className={styles.formField}>
          <label htmlFor="password" className={styles.formLabel}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.password ? styles.formInputError : ''}`}
            placeholder="Your password"
            disabled={isSubmitting}
          />
          {errors.password && <p className={styles.formError}>{errors.password}</p>}
        </div>
        
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      
      <div className={styles.formFooter}>
        <p>
          Don&apos;t have an account yet? 
          <Link href="/register" className={styles.formFooterLink}> Register now</Link>
        </p>
      </div>
    </div>
  );
};

// Simple fallback component
const LoginSkeleton = () => (
  <div className={styles.authForm}>
    <h1 className={styles.authTitle}>Loading...</h1>
  </div>
);

// Main component with Suspense boundary
const LoginPage = () => {
  return (
    <div className="container py-8">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginContent />
      </Suspense>
    </div>
  );
};

export default LoginPage;