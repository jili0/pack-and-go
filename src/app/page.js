import Link from "next/link";
import Image from "next/image";
import MovingCalculator from "@/components/forms/PriceCalculator";
import SearchForm from "@/components/forms/SearchForm";
import styles from "@/app/styles/Home.module.css";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Easy moving with transparent prices
            </h1>
            <p className={styles.heroText}>
              At Pack & Go, you&apos;ll find certified moving helpers at fair
              prices. Compare offers and book your move in just a few clicks.
            </p>
            <Link href="#searchCompanies" className={styles.heroBtn}>
              Plan your move now
            </Link>
          </div>
        </div>
      </section>

      {/* Moving Calculator */}
      <section  className={styles.calculator}>
        <div className={styles.calculatorContainer}>
          <h2 className={styles.calculatorTitle}>
            Calculate your moving price
          </h2>
          <MovingCalculator />
        </div>
      </section>

      {/* Search Section */}
      <section id="searchCompanies" className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Find moving companies</h2>
            <p className={styles.sectionSubtitle}>
              Enter your moving route to discover the best moving companies in your area
            </p>
          </div>
          <SearchForm />
        </div>
      </section>

      {/* How it works */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <p className={styles.sectionSubtitle}>
              Pack & Go makes your move a breeze. Just follow these three steps:
            </p>
          </div>

          <div className={styles.stepsList}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Submit request</h3>
              <p className={styles.stepDescription}>
                Enter your moving details and get an immediate price overview.
              </p>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Select company</h3>
              <p className={styles.stepDescription}>
                Compare reviews and choose the right moving company for your
                needs.
              </p>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Enjoy your move</h3>
              <p className={styles.stepDescription}>
                Sit back and let the professionals safely transport your
                belongings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Our advantages</h2>
          <p className={styles.sectionSubtitle}>
            Why more and more people choose Pack & Go for their move
          </p>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Transparent prices</h3>
              <p className={styles.featureDescription}>
                No hidden costs. You only pay for the time actually needed and
                the number of helpers.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Verified quality</h3>
              <p className={styles.featureDescription}>
                All moving companies are thoroughly checked. KisteKlar-certified
                providers guarantee the highest standards.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Genuine reviews</h3>
              <p className={styles.featureDescription}>
                Read experiences from other customers and make an informed
                decision for your move.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className={styles.citiesSection}>
        <div className={styles.citiesContainer}>
          <h2 className={styles.sectionTitle}>
            Top moving companies in major cities
          </h2>
          <p className={styles.sectionSubtitle}>
            Find verified moving companies in Germany&apos;s largest cities
          </p>

          <div className={styles.citiesGrid}>
            <Link href="/cities/berlin" className={styles.cityCard}>
              <div className={styles.cityImageWrapper}>
                <Image
                  src="/images/cities/berlin.png"
                  alt="Berlin"
                  fill
                  className={`${styles.cityImage} object-cover`}
                />
                <div className={styles.cityOverlay}></div>
                <div className={styles.cityContent}>
                  <h3 className={styles.cityTitle}>Berlin</h3>
                  <p className={styles.citySubtitle}>Top 10 moving companies</p>
                </div>
              </div>
            </Link>

            <Link href="/cities/hamburg" className={styles.cityCard}>
              <div className={styles.cityImageWrapper}>
                <Image
                  src="/images/cities/hamburg.png"
                  alt="Hamburg"
                  fill
                  className={`${styles.cityImage} object-cover`}
                />
                <div className={styles.cityOverlay}></div>
                <div className={styles.cityContent}>
                  <h3 className={styles.cityTitle}>Hamburg</h3>
                  <p className={styles.citySubtitle}>Top 10 moving companies</p>
                </div>
              </div>
            </Link>

            <Link href="/cities/munich" className={styles.cityCard}>
              <div className={styles.cityImageWrapper}>
                <Image
                  src="/images/cities/munich.png"
                  alt="Munich"
                  fill
                  className={`${styles.cityImage} object-cover`}
                />
                <div className={styles.cityOverlay}></div>
                <div className={styles.cityContent}>
                  <h3 className={styles.cityTitle}>Munich</h3>
                  <p className={styles.citySubtitle}>Top 10 moving companies</p>
                </div>
              </div>
            </Link>

            <Link href="/cities/cologne" className={styles.cityCard}>
              <div className={styles.cityImageWrapper}>
                <Image
                  src="/images/cities/cologne.png"
                  alt="Cologne"
                  fill
                  className={`${styles.cityImage} object-cover`}
                />
                <div className={styles.cityOverlay}></div>
                <div className={styles.cityContent}>
                  <h3 className={styles.cityTitle}>Cologne</h3>
                  <p className={styles.citySubtitle}>Top 10 moving companies</p>
                </div>
              </div>
            </Link>
          </div>

          <div className={styles.allCitiesLinkContainer}>
            <Link href="/cities" className={styles.allCitiesLink}>
              View all cities
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.allCitiesLinkIcon}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready for your stress-free move?</h2>
          <p className={styles.ctaText}>
            Get free and non-binding offers from verified moving companies in
            your region now.
          </p>
          <Link href="#calculator" className={styles.ctaBtn}>
            Plan your move now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.ctaBtnIcon}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}