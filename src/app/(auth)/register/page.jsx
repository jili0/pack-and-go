// src/app/(auth)/register/page.jsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/Components.module.css';

// Component for the content of the register form
const RegisterContent = () => {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user', // Default: regular user
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
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must agree to the Terms of Service';
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
    
    // Remove password confirmation from data before sending
    const { confirmPassword, terms, ...registrationData } = formData;
    
    try {
      const result = await register(registrationData);
      
      if (result.success) {
        // Redirect to dashboard
        router.push(formData.role === 'user' ? '/user' : '/company/setup');
      } else {
        setRegisterError(result.message || 'Registration failed');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('An error occurred. Please try again later.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.authForm}>
      <h1 className={styles.authTitle}>Create Account</h1>
      <p className={styles.authDescription}>Sign up to use Pack & Go for your next move.</p>
      
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
          <label htmlFor="name" className={styles.formLabel}>Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.name ? styles.formInputError : ''}`}
            placeholder="First and Last Name"
            disabled={isSubmitting}
          />
          {errors.name && <p className={styles.formError}>{errors.name}</p>}
        </div>
        
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
          <label htmlFor="phone" className={styles.formLabel}>Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
            placeholder="+1 123 456 7890"
            disabled={isSubmitting}
          />
          {errors.phone && <p className={styles.formError}>{errors.phone}</p>}
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
            placeholder="Minimum 6 characters"
            disabled={isSubmitting}
          />
          {errors.password && <p className={styles.formError}>{errors.password}</p>}
        </div>
        
        <div className={styles.formField}>
          <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.confirmPassword ? styles.formInputError : ''}`}
            placeholder="Repeat password"
            disabled={isSubmitting}
          />
          {errors.confirmPassword && <p className={styles.formError}>{errors.confirmPassword}</p>}
        </div>
        
        <div className={styles.formField}>
          <label htmlFor="role" className={styles.formLabel}>Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={styles.formInput}
            disabled={isSubmitting}
          >
            <option value="user">Customer</option>
            <option value="company">Moving Company</option>
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
            I agree to the <Link href="/terms" target="_blank" className={styles.formFooterLink}>Terms of Service</Link> and <Link href="/privacy" target="_blank" className={styles.formFooterLink}>Privacy Policy</Link>.
          </label>
        </div>
        {errors.terms && <p className={styles.formError}>{errors.terms}</p>}
        
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className={styles.formFooter}>
        <p>
          Already have an account? 
          <Link href="/login" className={styles.formFooterLink}> Sign in</Link>
        </p>
      </div>
    </div>
  );
};

// Simple fallback component
const RegisterSkeleton = () => (
  <div className={styles.authForm}>
    <h1 className={styles.authTitle}>Loading...</h1>
  </div>
);

// Main component with Suspense boundary
const RegisterPage = () => {
  return (
    <div className="container py-8">
      <Suspense fallback={<RegisterSkeleton />}>
        <RegisterContent />
      </Suspense>
    </div>
  );
};

export default RegisterPage;