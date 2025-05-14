// src/app/page.js
import Link from 'next/link';
import Image from 'next/image';
import MovingCalculator from '@/components/forms/PriceCalculator';
import styles from '@/app/styles/Home.module.css';

export default function Home() {
  return (
    <div>
      {/* Hero-Bereich */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Einfach umziehen mit transparenten Preisen</h1>
            <p className={styles.heroText}>
              Bei Pack & Go finden Sie zertifizierte Umzugshelfer zu fairen Preisen.
              Vergleichen Sie Angebote und buchen Sie Ihren Umzug in wenigen Klicks.
            </p>
            <Link href="#calculator" className={styles.heroBtn}>
              Jetzt Umzug planen
            </Link>
          </div>
        </div>
      </section>

      {/* Umzugsrechner */}
      <section id="calculator" className={styles.calculator}>
        <div className={styles.calculatorContainer}>
          <h2 className={styles.calculatorTitle}>Berechnen Sie Ihren Umzugspreis</h2>
          <MovingCalculator />
        </div>
      </section>

      {/* Wie es funktioniert */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>So einfach funktioniert's</h2>
            <p className={styles.sectionSubtitle}>
              Pack & Go macht Ihren Umzug zum Kinderspiel. Folgen Sie einfach diesen drei Schritten:
            </p>
          </div>
          
          <div className={styles.stepsList}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Anfrage stellen</h3>
              <p className={styles.stepDescription}>
                Geben Sie Ihre Umzugsdetails ein und erhalten Sie sofort einen Preisüberblick.
              </p>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Firma auswählen</h3>
              <p className={styles.stepDescription}>
                Vergleichen Sie Bewertungen und wählen Sie die passende Umzugsfirma für Ihre Bedürfnisse.
              </p>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Umzug genießen</h3>
              <p className={styles.stepDescription}>
                Lehnen Sie sich zurück und lassen Sie die Profis Ihre Sachen sicher transportieren.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vorteile */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Unsere Vorteile</h2>
          <p className={styles.sectionSubtitle}>
            Warum immer mehr Menschen Pack & Go für ihren Umzug wählen
          </p>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Transparente Preise</h3>
              <p className={styles.featureDescription}>
                Keine versteckten Kosten. Sie zahlen nur für die tatsächlich benötigte Zeit und die Anzahl der Helfer.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Geprüfte Qualität</h3>
              <p className={styles.featureDescription}>
                Alle Umzugsfirmen werden sorgfältig überprüft. KisteKlar-zertifizierte Anbieter garantieren höchste Standards.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Echte Bewertungen</h3>
              <p className={styles.featureDescription}>
                Lesen Sie Erfahrungen anderer Kunden und treffen Sie eine informierte Entscheidung für Ihren Umzug.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Städte-Sektion */}
      <section className={styles.citiesSection}>
        <div className={styles.citiesContainer}>
          <h2 className={styles.sectionTitle}>Top Umzugsunternehmen in großen Städten</h2>
          <p className={styles.sectionSubtitle}>
            Finden Sie verifizierte Umzugsunternehmen in den größten Städten Deutschlands
          </p>
          
          <div className={styles.citiesGrid}>
            <Link href="/stadt/berlin" className={styles.cityCard}>
              <div className={styles.cityImageWrapper}>
                <Image 
                  src="/images/cities/berlin.jpg" 
                  alt="Berlin" 
                  fill
                  className={`${styles.cityImage} object-cover`}
                />
                <div className={styles.cityOverlay}></div>
                <div className={styles.cityContent}>
                  <h3 className={styles.cityTitle}>Berlin</h3>
                  <p className={styles.citySubtitle}>Top 10 Umzugsunternehmen</p>
                </div>
              </div>
            </Link>
            
            <Link href="/stadt/hamburg" className={styles.cityCard}>
              <div className={styles.cityImageWrapper}>
                <Image 
                  src="/images/cities/hamburg.jpg" 
                  alt="Hamburg" 
                  fill
                  className={`${styles.cityImage} object-cover`}
                />
                <div className={styles.cityOverlay}></div>
                <div className={styles.cityContent}>
                  <h3 className={styles.cityTitle}>Hamburg</h3>
                  <p className={styles.citySubtitle}>Top 10 Umzugsunternehmen</p>
                </div>
              </div>
            </Link>
            
            <Link href="/stadt/muenchen" className={styles.cityCard}>
              <div className={styles.cityImageWrapper}>
                <Image 
                  src="/images/cities/muenchen.jpg" 
                  alt="München" 
                  fill
                  className={`${styles.cityImage} object-cover`}
                />
                <div className={styles.cityOverlay}></div>
                <div className={styles.cityContent}>
                  <h3 className={styles.cityTitle}>München</h3>
                  <p className={styles.citySubtitle}>Top 10 Umzugsunternehmen</p>
                </div>
              </div>
            </Link>
            
            <Link href="/stadt/koeln" className={styles.cityCard}>
              <div className={styles.cityImageWrapper}>
                <Image 
                  src="/images/cities/koeln.jpg" 
                  alt="Köln" 
                  fill
                  className={`${styles.cityImage} object-cover`}
                />
                <div className={styles.cityOverlay}></div>
                <div className={styles.cityContent}>
                  <h3 className={styles.cityTitle}>Köln</h3>
                  <p className={styles.citySubtitle}>Top 10 Umzugsunternehmen</p>
                </div>
              </div>
            </Link>
          </div>
          
          <div className={styles.allCitiesLinkContainer}>
            <Link 
              href="/staedte" 
              className={styles.allCitiesLink}
            >
              Alle Städte ansehen
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.allCitiesLinkIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Bereit für Ihren stressfreien Umzug?</h2>
          <p className={styles.ctaText}>
            Holen Sie sich jetzt kostenlos und unverbindlich Angebote von verifizierten Umzugsfirmen in Ihrer Region.
          </p>
          <Link 
            href="#calculator" 
            className={styles.ctaBtn}
          >
            Jetzt Umzug planen
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.ctaBtnIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}