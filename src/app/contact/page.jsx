// src/app/contact/page.jsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from '@/app/styles/Contact.module.css';
import Image from '@/components/ui/Image';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm();
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitSuccess(true);
        reset(); // Reset form on success
      } else {
        setSubmitError(result.message || 'Failed to send your message. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.contactPage}>
      {/* Hero section */}
      <div className={styles.contactHero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p className={styles.heroSubtitle}>
            Have questions about Pack & Go? We're here to help you with all your moving needs.
          </p>
        </div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.contactContent}>
          {/* Contact form and info columns */}
          <div className={styles.contactGrid}>
            {/* Contact form column */}
            <div className={styles.formColumn}>
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Send us a message</h2>
                <p className={styles.formSubtitle}>
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
                
                {submitSuccess && (
                  <div className={styles.successAlert}>
                    <div className={styles.successIcon}>✓</div>
                    <div className={styles.successMessage}>
                      <h3 className={styles.successTitle}>Message sent successfully!</h3>
                      <p>Thank you for contacting us. We'll respond to your inquiry shortly.</p>
                    </div>
                  </div>
                )}
                
                {submitError && (
                  <div className={styles.errorAlert}>
                    <div className={styles.errorIcon}>!</div>
                    <div className={styles.errorMessage}>
                      <h3 className={styles.errorTitle}>Error</h3>
                      <p>{submitError}</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className={styles.contactForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name" className={styles.formLabel}>
                        Name
                      </label>
                      <input
                        id="name"
                        className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                        type="text"
                        placeholder="Your name"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && (
                        <span className={styles.errorText}>{errors.name.message}</span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        Email
                      </label>
                      <input
                        id="email"
                        className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                        type="email"
                        placeholder="Your email address"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.email && (
                        <span className={styles.errorText}>{errors.email.message}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="subject" className={styles.formLabel}>
                      Subject
                    </label>
                    <input
                      id="subject"
                      className={`${styles.formInput} ${errors.subject ? styles.inputError : ''}`}
                      type="text"
                      placeholder="What is your message about?"
                      {...register('subject', { required: 'Subject is required' })}
                    />
                    {errors.subject && (
                      <span className={styles.errorText}>{errors.subject.message}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.formLabel}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      className={`${styles.formTextarea} ${errors.message ? styles.inputError : ''}`}
                      placeholder="Your message"
                      rows="5"
                      {...register('message', {
                        required: 'Message is required',
                        minLength: {
                          value: 20,
                          message: 'Message should be at least 20 characters'
                        }
                      })}
                    ></textarea>
                    {errors.message && (
                      <span className={styles.errorText}>{errors.message.message}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="reason" className={styles.formLabel}>
                      Reason for contact
                    </label>
                    <select
                      id="reason"
                      className={`${styles.formSelect} ${errors.reason ? styles.inputError : ''}`}
                      {...register('reason', { required: 'Please select a reason' })}
                    >
                      <option value="">Select a reason</option>
                      <option value="quote">Request a quote</option>
                      <option value="question">General question</option>
                      <option value="support">Customer support</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Business partnership</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.reason && (
                      <span className={styles.errorText}>{errors.reason.message}</span>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Contact information column */}
            <div className={styles.infoColumn}>
              <div className={styles.infoCard}>
                <h2 className={styles.infoTitle}>Contact Information</h2>
                
                <div className={styles.contactInfo}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div className={styles.infoContent}>
                      <h3 className={styles.infoLabel}>Phone</h3>
                      <p className={styles.infoText}>+49 (0) 30 1234 5678</p>
                      <p className={styles.infoSubtext}>Monday to Friday, 9am to 6pm</p>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div className={styles.infoContent}>
                      <h3 className={styles.infoLabel}>Email</h3>
                      <p className={styles.infoText}>support@pack-and-go.de</p>
                      <p className={styles.infoSubtext}>We'll respond as soon as possible</p>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div className={styles.infoContent}>
                      <h3 className={styles.infoLabel}>Office</h3>
                      <p className={styles.infoText}>Friedrichstraße 123</p>
                      <p className={styles.infoText}>10117 Berlin, Germany</p>
                    </div>
                  </div>
                </div>
                
                <div className={styles.socialLinks}>
                  <h3 className={styles.socialTitle}>Follow Us</h3>
                  <div className={styles.socialIcons}>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className={styles.mapCard}>
                <h3 className={styles.mapTitle}>Find Us</h3>
                <div className={styles.mapContainer}>
                  <Image
                    src="/images/map.jpg"
                    alt="Office location map"
                    width={500}
                    height={300}
                    className={styles.mapImage}
                  />
                  <a 
                    href="https://goo.gl/maps/123Friedrichstrasse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLink}
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ section */}
      <div className={styles.faqSection}>
        <div className={styles.container}>
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          <p className={styles.faqSubtitle}>Find quick answers to common questions about our services.</p>
          
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How does Pack & Go pricing work?</h3>
              <p className={styles.faqAnswer}>
                Our pricing is transparent and based on three factors: the hourly rate of the moving company (per helper), the number of helpers needed, and the estimated duration of the move. These three values are multiplied to determine the total price.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How are my belongings insured during the move?</h3>
              <p className={styles.faqAnswer}>
                All moving companies on our platform have basic insurance for transport damage. Companies with the KisteKlar certification offer additional insurance coverage. The exact insurance conditions may vary by company and will be transparently presented to you before booking.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I cancel or reschedule my booking?</h3>
              <p className={styles.faqAnswer}>
                Yes, you can cancel or reschedule your booking. Cancellation up to 7 days before the move is free. For later cancellations, fees may apply depending on how close to the moving date you cancel. A date change is usually free if notified at least 48 hours before the scheduled move.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What is the KisteKlar certification?</h3>
              <p className={styles.faqAnswer}>
                The KisteKlar certification is our quality standard for moving companies. Certified companies have been thoroughly verified and meet high quality standards. They offer additional insurance protection and employ professionally trained staff with experience in handling valuable items.
              </p>
            </div>
          </div>
          
          <div className={styles.moreFaqLink}>
            <a href="/faq" className={styles.faqLink}>
              View all FAQs
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.faqLinkIcon}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}