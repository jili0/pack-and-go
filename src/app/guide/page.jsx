// src/app/how-it-works/page.jsx
import React from 'react';
import Link from 'next/link';
import Image from '@/components/ui/Image';
import styles from '@/app/styles/Guide.module.css';

export const metadata = {
  title: 'Guide | Pack & Go',
  description: 'Learn how Pack & Go works in 3 simple steps. Find, compare, and book moving companies with transparent pricing.',
};

export default function HowItWorks() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>How Pack & Go Works</h1>
          <p className={styles.heroSubtitle}>
            Moving has never been easier. With Pack & Go, you can quickly find, compare, and book moving companies with transparent pricing.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className={styles.processSection}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Move in 3 Simple Steps</h2>
            <p className={styles.sectionSubtitle}>
              At Pack & Go, we value simplicity and transparency. Our process is designed to save you time and stress.
            </p>
          </div>

          <div className={styles.stepsContainer}>
            <div className={styles.stepLine}></div>

            {/* Step 1 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Submit a Request</h3>
                <div className={styles.stepImageContainer}>
                  <Image
                    src="/images/step1.jpg"
                    alt="Submit a request"
                    width={400}
                    height={300}
                    className={styles.stepImage}
                  />
                </div>
                <p className={styles.stepDescription}>
                  Enter your starting and destination addresses, select the number of helpers needed, and estimate the required time. No complicated moving calculator necessary!
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Compare Offers</h3>
                <div className={styles.stepImageContainer}>
                  <Image
                    src="/images/step2.jpg"
                    alt="Compare offers"
                    width={400}
                    height={300}
                    className={styles.stepImage}
                  />
                </div>
                <p className={styles.stepDescription}>
                  Immediately receive a list of available moving companies for your route. Compare reviews, prices, and availability to make an informed decision.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Book Your Move</h3>
                <div className={styles.stepImageContainer}>
                  <Image
                    src="/images/step3.jpg"
                    alt="Book your move"
                    width={400}
                    height={300}
                    className={styles.stepImage}
                  />
                </div>
                <p className={styles.stepDescription}>
                  Choose your preferred moving company and up to three desired dates. After confirmation by the company, your move is all set!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Model */}
      <section className={styles.pricingSection}>
        <div className={styles.sectionContent}>
          <div className={styles.pricingGrid}>
            <div className={styles.pricingInfo}>
              <h2 className={styles.sectionTitle}>Our Transparent Pricing Model</h2>
              <p className={styles.sectionText}>
                At Pack & Go, there are no hidden costs or complicated calculations. Our pricing model is simple and transparent.
              </p>
              
              <div className={styles.pricingCard}>
                <h3 className={styles.cardTitle}>How we calculate the price:</h3>
                <div className={styles.pricingItems}>
                  <div className={styles.pricingItem}>
                    <div className={styles.pricingIcon}>💰</div>
                    <p>
                      <span className={styles.bold}>Hourly rate per helper:</span> Each moving company sets their own hourly rate (typically between 40€ and 60€ per helper)
                    </p>
                  </div>
                  
                  <div className={styles.pricingItem}>
                    <div className={styles.pricingIcon}>👥</div>
                    <p>
                      <span className={styles.bold}>Number of helpers:</span> You choose how many helpers you need (minimum: 2)
                    </p>
                  </div>
                  
                  <div className={styles.pricingItem}>
                    <div className={styles.pricingIcon}>⏱️</div>
                    <p>
                      <span className={styles.bold}>Estimated hours:</span> You estimate how long the move will take
                    </p>
                  </div>
                  
                  <div className={styles.pricingFormula}>
                    <div className={styles.pricingIcon}>🧮</div>
                    <p className={styles.bold}>
                      Total price = Hourly rate × Number of helpers × Estimated hours
                    </p>
                  </div>
                </div>
              </div>
              
              <p className={styles.disclaimer}>
                <strong>Note:</strong> The final price may vary if the actual duration of the move differs from the estimated time. Billing is always based on the actual time needed.
              </p>
            </div>
            
            <div className={styles.pricingExamples}>
              <h3 className={styles.examplesTitle}>Price Examples</h3>
              
              <div className={styles.exampleCard}>
                <h4 className={styles.exampleTitle}>Small Move (1-room apartment)</h4>
                <div className={styles.exampleDetails}>
                  <div className={styles.exampleRow}>
                    <span className={styles.exampleLabel}>Hourly rate per helper:</span>
                    <span className={styles.exampleValue}>50 €</span>
                  </div>
                  <div className={styles.exampleRow}>
                    <span className={styles.exampleLabel}>Number of helpers:</span>
                    <span className={styles.exampleValue}>2</span>
                  </div>
                  <div className={styles.exampleRow}>
                    <span className={styles.exampleLabel}>Estimated hours:</span>
                    <span className={styles.exampleValue}>3</span>
                  </div>
                  <div className={`${styles.exampleRow} ${styles.exampleTotal}`}>
                    <span className={styles.exampleLabel}>Total price:</span>
                    <span className={styles.examplePrice}>300 €</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.exampleCard}>
                <h4 className={styles.exampleTitle}>Medium Move (2-3 room apartment)</h4>
                <div className={styles.exampleDetails}>
                  <div className={styles.exampleRow}>
                    <span className={styles.exampleLabel}>Hourly rate per helper:</span>
                    <span className={styles.exampleValue}>50 €</span>
                  </div>
                  <div className={styles.exampleRow}>
                    <span className={styles.exampleLabel}>Number of helpers:</span>
                    <span className={styles.exampleValue}>3</span>
                  </div>
                  <div className={styles.exampleRow}>
                    <span className={styles.exampleLabel}>Estimated hours:</span>
                    <span className={styles.exampleValue}>5</span>
                  </div>
                  <div className={`${styles.exampleRow} ${styles.exampleTotal}`}>
                    <span className={styles.exampleLabel}>Total price:</span>
                    <span className={styles.examplePrice}>750 €</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.exampleCard}>
                <h4 className={styles.exampleTitle}>Large Move (4+ room apartment)</h4>
                <div className={styles.exampleDetails}>
                  <div className={styles.exampleRow}>
                    <span className={styles.exampleLabel}>Hourly rate per helper:</span>
                    <span className={styles.exampleValue}>50 €</span>
                  </div>
                  <div className={styles.exampleRow}>
                    <span className={styles.exampleLabel}>Number of helpers:</span>
                    <span className={styles.exampleValue}>4</span>
                  </div>
                  <div className={styles.exampleRow}>
                    <span className={styles.exampleLabel}>Estimated hours:</span>
                    <span className={styles.exampleValue}>7</span>
                  </div>
                  <div className={`${styles.exampleRow} ${styles.exampleTotal}`}>
                    <span className={styles.exampleLabel}>Total price:</span>
                    <span className={styles.examplePrice}>1,400 €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KisteKlar Certification */}
      <section className={styles.certificationSection}>
        <div className={styles.sectionContent}>
          <div className={styles.certificationGrid}>
            <div className={styles.certificationImage}>
              <Image
                src="/images/certification.jpg"
                alt="KisteKlar Certification"
                width={500}
                height={400}
                className={styles.certImage}
              />
            </div>
            <div className={styles.certificationInfo}>
              <div className={styles.certificationBadge}>Quality Standard</div>
              <h2 className={styles.sectionTitle}>The KisteKlar Certificate</h2>
              <p className={styles.sectionText}>
                Moving companies with the KisteKlar certificate meet particularly high quality standards and offer you additional security for your move.
              </p>
              <div className={styles.certificationFeatures}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>✓</div>
                  <div className={styles.featureText}>
                    <h4 className={styles.featureTitle}>Verified Identity</h4>
                    <p className={styles.featureDescription}>All documents and licenses are carefully checked by our team.</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>✓</div>
                  <div className={styles.featureText}>
                    <h4 className={styles.featureTitle}>Comprehensive Insurance</h4>
                    <p className={styles.featureDescription}>Additional insurance coverage for your furniture and items.</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>✓</div>
                  <div className={styles.featureText}>
                    <h4 className={styles.featureTitle}>Trained Personnel</h4>
                    <p className={styles.featureDescription}>All employees are professionally trained and have experience in handling valuable items.</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>✓</div>
                  <div className={styles.featureText}>
                    <h4 className={styles.featureTitle}>Quality Guarantee</h4>
                    <p className={styles.featureDescription}>In case of damage, you receive quick and uncomplicated compensation.</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.certificationNote}>
                <p>
                  The KisteKlar certificate is only awarded to companies that meet our strict quality criteria and are regularly reviewed.
                </p>
                <p>
                  When searching for moving companies, you can specifically filter for certified companies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className={styles.faqSection}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Find answers to the most common questions about Pack & Go and our service.
            </p>
          </div>
          
          <div className={styles.faqContainer}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How exactly does the price calculation work?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  Our transparent pricing model is based on three factors: the hourly rate of the moving company (per helper), the number of helpers needed, and the estimated duration of the move. These three values are multiplied to determine the total price. This way, you can see exactly what your move will cost in advance.
                </p>
              </div>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What happens if my move takes longer than estimated?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  The price given at booking is based on your estimate. If the move actually takes longer, the additional time will be charged at the agreed hourly rate. Conversely, if the move is completed faster, you only pay for the time actually needed.
                </p>
              </div>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How is my furniture insured during the move?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  All moving companies on our platform have basic insurance for transport damages. Moving companies with the KisteKlar certificate offer additional insurance coverage. The exact insurance conditions may vary from company to company and will be transparently presented to you before booking.
                </p>
              </div>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I cancel or reschedule a booking?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  Yes, you can cancel or reschedule your booking. Please note that different conditions apply depending on when you cancel:
                </p>
                <ul className={styles.faqList}>
                  <li>Cancellation up to 7 days before the move: free of charge</li>
                  <li>Cancellation 3-6 days before the move: 30% of the total price</li>
                  <li>Cancellation 1-2 days before the move: 50% of the total price</li>
                  <li>Cancellation on the day of the move: 100% of the total price</li>
                </ul>
                <p>
                  Rescheduling is usually free of charge if communicated at least 48 hours before the planned move and an alternative date is agreed upon.
                </p>
              </div>
            </div>
            
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How can I be sure that the moving company is reputable?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  All moving companies on our platform are carefully vetted before being accepted. We verify their identity, licenses, and insurance. In addition, you can read reviews from other customers to get an idea of the quality of service. Moving companies with the KisteKlar certificate meet additional strict quality standards and are regularly reviewed.
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.contactSection}>
            <p className={styles.contactText}>
              Do you have more questions? Feel free to contact us!
            </p>
            <Link href="/contact" className={styles.contactButton}>
              Contact Form
            </Link>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready for Your Stress-Free Move?</h2>
          <p className={styles.ctaSubtitle}>
            Get free, no-obligation quotes from verified moving companies in your area.
          </p>
          <Link href="/" className={styles.ctaButton}>
            Plan Your Move Now
            <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}