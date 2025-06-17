// src/components/dashboard/ProfileForm.jsx (continued)
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/UserProfile.module.css';

const ProfileForm = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordType, setPasswordType] = useState('password');
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  // Set form values when user data is available
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
    }
  }, [user, setValue]);
  
  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      // Only include password fields if the user is trying to change password
      const payload = {
        name: data.name,
        phone: data.phone
      };
      
      // Only include password fields if current password is provided
      if (data.currentPassword) {
        if (data.newPassword !== data.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        
        // Clear password fields
        setValue('currentPassword', '');
        setValue('newPassword', '');
        setValue('confirmPassword', '');
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/delete', {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Redirect will happen automatically due to auth context
      } else {
        setError(result.message || 'Failed to delete account');
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('An error occurred. Please try again later.');
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === 'password' ? 'text' : 'password');
  };
  
  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading profile data...</p>
      </div>
    );
  }
  
  return (
    <div className={styles.profileForm}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>My Profile</h2>
        </div>
        
        <div className={styles.cardBody}>
          {success && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              Your profile has been updated successfully.
            </div>
          )}
          
          {error && (
            <div className={`${styles.alert} ${styles.alertDanger}`}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formSection}>
              <h3>Personal Information</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <span className={styles.errorMessage}>{errors.name.message}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  disabled
                  {...register('email')}
                />
                <small className={styles.helpText}>
                  Email address cannot be changed
                </small>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[0-9\s\-()]{8,}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                />
                {errors.phone && (
                  <span className={styles.errorMessage}>{errors.phone.message}</span>
                )}
              </div>
            </div>
            
            <div className={styles.formSection}>
              <h3>Change Password</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword" className={styles.label}>
                  Current Password
                </label>
                <div className={styles.passwordInput}>
                  <input
                    id="currentPassword"
                    type={passwordType}
                    className={`${styles.input} ${errors.currentPassword ? styles.inputError : ''}`}
                    {...register('currentPassword', {
                      validate: value => 
                        (!value && !document.getElementById('newPassword').value) || 
                        value.length >= 6 || 
                        'Password must be at least 6 characters'
                    })}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={togglePasswordVisibility}
                  >
                    {passwordType === 'password' ? 'Show' : 'Hide'}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className={styles.errorMessage}>{errors.currentPassword.message}</span>
                )}
                <small className={styles.helpText}>
                  Leave blank if you don't want to change your password
                </small>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  type={passwordType}
                  className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
                  {...register('newPassword', {
                    validate: value => 
                      (!value && !document.getElementById('currentPassword').value) || 
                      value.length >= 6 || 
                      'Password must be at least 6 characters'
                  })}
                />
                {errors.newPassword && (
                  <span className={styles.errorMessage}>{errors.newPassword.message}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type={passwordType}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  {...register('confirmPassword', {
                    validate: value => 
                      (!value && !document.getElementById('currentPassword').value) || 
                      value === document.getElementById('newPassword').value || 
                      'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && (
                  <span className={styles.errorMessage}>{errors.confirmPassword.message}</span>
                )}
              </div>
            </div>
            
            <div className={styles.formActions}>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        <div className={styles.cardFooter}>
          <div className={styles.dangerZone}>
            <h3>Delete Account</h3>
            <p>
              Once you delete your account, there is no going back. All of your data will be permanently removed.
            </p>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Delete Account</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete your account?</p>
              <p className={styles.warningText}>
                This action cannot be undone. All your data, including orders and reviews, will be permanently removed.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`} 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`${styles.btn} ${styles.btnDanger}`} 
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;