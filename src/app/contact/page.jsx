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

    // Clear errors on typing
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
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please enter a message';
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
          message: 'Thank you for your message! We will get back to you as soon as possible.'
        });
        // Reset form only on success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitResult({
          success: false,
          message: data.message || 'An error occurred. Please try again later.'
        });
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitResult({
        success: false,
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero Section with Gradient */}
      <div className={styles.contactHero}>
        <div className={styles.heroBackground}></div>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Get In Touch With Us</h1>
            <p className={styles.heroSubtitle}>
              Ready to simplify your moving experience? We're here to help you every step of the way.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>24h</div>
                <div className={styles.statLabel}>Response Time</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>500+</div>
                <div className={styles.statLabel}>Happy Customers</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.contactContent}>
        <div className="container">
          <div className={styles.contactGrid}>
            {/* Contact Form */}
            <div className={styles.formColumn}>
              <div className={styles.formCard}>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>Send Us a Message</h2>
                  <p className={styles.formSubtitle}>
                    We'd love to hear from you. Send us a message and we'll respond within 24 hours.
                  </p>
                </div>
                
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
                        <h3 className={styles.successTitle}>Message Sent!</h3>
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
                        <h3 className={styles.errorTitle}>Error</h3>
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
                      <label htmlFor="name" className={styles.formLabel}>Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                        placeholder="Your full name"
                        disabled={isSubmitting}
                      />
                      {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                        placeholder="your.email@example.com"
                        disabled={isSubmitting}
                      />
                      {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="subject" className={styles.formLabel}>Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={styles.formSelect}
                      disabled={isSubmitting}
                    >
                      <option value="">Select a topic</option>
                      <option value="moving-services">Moving Services</option>
                      <option value="packing-supplies">Packing Supplies</option>
                      <option value="storage-solutions">Storage Solutions</option>
                      <option value="quote-request">Quote Request</option>
                      <option value="general-inquiry">General Inquiry</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.formLabel}>Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`${styles.formTextarea} ${errors.message ? styles.inputError : ''}`}
                      placeholder="Tell us about your moving needs or ask any questions..."
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
                    <span className={styles.buttonText}>
                      {isSubmitting ? 'Sending Message...' : 'Send Message'}
                    </span>
                    <svg className={styles.buttonIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className={styles.infoColumn}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Contact Information</h3>
                <p className={styles.infoDescription}>
                  Get in touch with us through any of these channels. We're always ready to help!
                </p>
                
                <div className={styles.contactInfo}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.infoLabel}>Email Us</h4>
                      <p className={styles.infoText}>hello@pack-and-go.com</p>
                      <p className={styles.infoSubtext}>We reply within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.infoLabel}>Call Us</h4>
                      <p className={styles.infoText}>+1 (555) 123-4567</p>
                      <p className={styles.infoSubtext}>Mon-Fri 8AM to 6PM EST</p>
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
                      <h4 className={styles.infoLabel}>Visit Us</h4>
                      <p className={styles.infoText}>123 Moving Street</p>
                      <p className={styles.infoText}>New York, NY 10001</p>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.infoLabel}>Business Hours</h4>
                      <p className={styles.infoText}>Monday - Friday: 8AM - 6PM</p>
                      <p className={styles.infoText}>Saturday: 9AM - 4PM</p>
                      <p className={styles.infoSubtext}>Closed on Sundays</p>
                    </div>
                  </div>
                </div>
                
                <div className={styles.socialLinks}>
                  <h4 className={styles.socialTitle}>Follow Us</h4>
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
              
              {/* Quick Service Cards */}
              <div className={styles.serviceCards}>
                <div className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9,22 9,12 15,12 15,22"></polyline>
                    </svg>
                  </div>
                  <h4 className={styles.serviceTitle}>Residential Moving</h4>
                  <p className={styles.serviceText}>Professional home moving services</p>
                </div>
                
                <div className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </div>
                  <h4 className={styles.serviceTitle}>Office Relocation</h4>
                  <p className={styles.serviceText}>Seamless business moving solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className={styles.faqSection}>
        <div className="container">
          <div className={styles.faqHeader}>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            <p className={styles.faqSubtitle}>
              Get quick answers to common questions about our moving services
            </p>
          </div>
          
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How far in advance should I book?</h3>
              <p className={styles.faqAnswer}>
                We recommend booking at least 2-4 weeks in advance, especially during peak moving seasons (summer months and month-end).
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Do you provide packing materials?</h3>
              <p className={styles.faqAnswer}>
                Yes! We offer a complete range of packing supplies including boxes, bubble wrap, packing paper, and specialty containers for fragile items.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Are my belongings insured?</h3>
              <p className={styles.faqAnswer}>
                All moves include basic liability coverage. We also offer comprehensive insurance options for additional protection of your valuable items.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What areas do you serve?</h3>
              <p className={styles.faqAnswer}>
                We provide moving services throughout the tri-state area, including local, long-distance, and interstate moves. Contact us for specific location coverage.
              </p>
            </div>
          </div>
          
          <div className={styles.moreFaqLink}>
            <a href="/faq" className={styles.faqLink}>
              View All FAQs
              <svg className={styles.faqLinkIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7,7 17,7 17,17"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;