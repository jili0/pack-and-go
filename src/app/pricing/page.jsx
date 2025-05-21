import Link from "next/link";
import Image from "@/components/ui/Image";
import PriceCalculator from "@/components/forms/PriceCalculator";
import styles from "@/app/styles/Pricing.module.css";

export const metadata = {
  title: "Pricing - Pack & Go",
  description:
    "Transparent and simple pricing for your moving needs. No hidden costs, just pay for the time and number of helpers you need.",
};
export default function Pricing() {
  return (
    <div className={styles.pricingPage}>
      {/* Hero Section with improved design */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>FAIR PRICING</span>
            <h1>Simple & Transparent Prices</h1>
            <p className={styles.heroText}>
              Our pricing model is clear and easy to understand. No hidden costs,
              no complex calculations – you only pay for the time and number of
              helpers you need for your move.
            </p>
            <div className={styles.heroButtons}>
              <Link href="#calculator" className={styles.btnPrimary}>
                Calculate costs
              </Link>
              <Link href="#examples" className={styles.btnOutline}>
                View price examples
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image 
              src="/images/pricing-hero.png" 
              alt="Moving prices" 
              width={100} 
              height={100}
              className={styles.heroIllustration}
            />
          </div>
        </div>
      </section>

      {/* Pricing Model Section with improved cards */}
      <section className={styles.pricingModelSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>OUR PRICING MODEL</span>
            <h2>How our pricing works</h2>
            <p>
              At Pack & Go, we believe in transparency. Our pricing model is simple and fair,
              based on the time needed and the number of helpers required for your move.
            </p>
          </div>

          <div className={styles.pricingCards}>
            <div className={styles.pricingCard}>
              <div className={styles.pricingCardIcon}>
                <Image
                  src="/images/hourly-rate.png"
                  alt="Hourly rate"
                  width={64}
                  height={64}
                />
              </div>
              <h3>Hourly Rate</h3>
              <p>
                Each moving company sets its own hourly rate per helper,
                typically between €40 and €60.
              </p>
              <div className={styles.cardHighlight}>€40 - €60</div>
            </div>

            <div className={styles.pricingCard}>
              <div className={styles.pricingCardIcon}>
                <Image
                  src="/images/helpers-icon.png"
                  alt="Number of helpers"
                  width={64}
                  height={64}
                />
              </div>
              <h3>Number of Helpers</h3>
              <p>
                You choose how many moving helpers you need (minimum 2).
                More helpers can reduce the total time of your move.
              </p>
              <div className={styles.cardHighlight}>min. 2 helpers</div>
            </div>

            <div className={styles.pricingCard}>
              <div className={styles.pricingCardIcon}>
                <Image
                  src="/images/time-icon.png"
                  alt="Estimated hours"
                  width={64}
                  height={64}
                />
              </div>
              <h3>Estimated Hours</h3>
              <p>
                You estimate how long your move will take. The final price
                is based on the actual time spent.
              </p>
              <div className={styles.cardHighlight}>Flexible duration</div>
            </div>
          </div>

          <div className={styles.pricingFormula}>
            <div className={styles.formulaBox}>
              <h3>The Formula</h3>
              <div className={styles.formula}>
                <div className={styles.formulaElement}>
                  <span className={styles.formulaValue}>Hourly rate</span>
                  <span className={styles.formulaLabel}>per helper</span>
                </div>
                <span className={styles.formulaOperator}>×</span>
                <div className={styles.formulaElement}>
                  <span className={styles.formulaValue}>Number</span>
                  <span className={styles.formulaLabel}>of helpers</span>
                </div>
                <span className={styles.formulaOperator}>×</span>
                <div className={styles.formulaElement}>
                  <span className={styles.formulaValue}>Estimated</span>
                  <span className={styles.formulaLabel}>hours</span>
                </div>
                <span className={styles.formulaOperator}>=</span>
                <div className={styles.formulaResult}>
                  <span className={styles.formulaValue}>Total price</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.pricingNote}>
            <div className={styles.noteIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div className={styles.noteText}>
              <p>
                <strong>Note:</strong> The final price may vary if the actual time needed
                differs from your estimate. You will only be charged for the time actually
                spent on your move.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Price Calculator Section with better layout */}
      <section id="calculator" className={styles.calculatorSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>PRICE CALCULATOR</span>
            <h2>Calculate Your Moving Costs</h2>
            <p>Use our simple calculator to estimate the costs for your move.</p>
          </div>

          <div className={styles.calculatorWrapper}>
            <div className={styles.calculatorContainer}>
              <PriceCalculator />
            </div>
            <div className={styles.calculatorInfo}>
              <h3>Why use our price calculator?</h3>
              <ul className={styles.calculatorFeatures}>
                <li>
                  <span className={styles.featureIcon}>✓</span>
                  <span>Instant cost estimation</span>
                </li>
                <li>
                  <span className={styles.featureIcon}>✓</span>
                  <span>Transparent calculation</span>
                </li>
                <li>
                  <span className={styles.featureIcon}>✓</span>
                  <span>No hidden costs</span>
                </li>
                <li>
                  <span className={styles.featureIcon}>✓</span>
                  <span>Customizable to your needs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Price Examples Section with improved layout */}
      <section id="examples" className={styles.examplesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>PRICE EXAMPLES</span>
            <h2>Example Moving Scenarios</h2>
            <p>
              Here are some typical moving scenarios to give you an overview of the costs.
            </p>
          </div>

          <div className={styles.exampleCards}>
            <div className={styles.exampleCard}>
              <div className={styles.exampleHeader}>
                <h3>Studio Apartment</h3>
                <div className={styles.exampleBadge}>Small Move</div>
              </div>
              <div className={styles.exampleImage}>
                <Image
                  src="/images/apartment.png"
                  alt="Studio apartment"
                  width={30}
                  height={30}
                  className={styles.exampleIllustration}
                />
              </div>
              <div className={styles.exampleDetails}>
                <div className={styles.exampleCalculation}>
                  <div className={styles.calculationRow}>
                    <span className={styles.calculationLabel}>
                      Hourly rate per helper:
                    </span>
                    <span className={styles.calculationValue}>€50</span>
                  </div>
                  <div className={styles.calculationRow}>
                    <span className={styles.calculationLabel}>
                      Number of helpers:
                    </span>
                    <span className={styles.calculationValue}>2</span>
                  </div>
                  <div className={styles.calculationRow}>
                    <span className={styles.calculationLabel}>
                      Estimated hours:
                    </span>
                    <span className={styles.calculationValue}>3</span>
                  </div>
                  <div className={styles.calculationTotal}>
                    <span className={styles.calculationLabel}>
                      Total price:
                    </span>
                    <span className={styles.calculationTotalValue}>€300</span>
                  </div>
                </div>
                <div className={styles.exampleInfo}>
                  <p>
                    Ideal for a studio or 1-bedroom apartment with few items of furniture.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.exampleCard}>
              <div className={styles.exampleHeader}>
                <h3>2-3 Room Apartment</h3>
                <div className={styles.exampleBadge}>Medium Move</div>
              </div>
              <div className={styles.exampleImage}>
                <Image
                  src="/images/apartment.png"
                  alt="2-3 room apartment"
                  width={40}
                  height={40}
                  className={styles.exampleIllustration}
                />
              </div>
              <div className={styles.exampleDetails}>
                <div className={styles.exampleCalculation}>
                  <div className={styles.calculationRow}>
                    <span className={styles.calculationLabel}>
                      Hourly rate per helper:
                    </span>
                    <span className={styles.calculationValue}>€50</span>
                  </div>
                  <div className={styles.calculationRow}>
                    <span className={styles.calculationLabel}>
                      Number of helpers:
                    </span>
                    <span className={styles.calculationValue}>3</span>
                  </div>
                  <div className={styles.calculationRow}>
                    <span className={styles.calculationLabel}>
                      Estimated hours:
                    </span>
                    <span className={styles.calculationValue}>5</span>
                  </div>
                  <div className={styles.calculationTotal}>
                    <span className={styles.calculationLabel}>
                      Total price:
                    </span>
                    <span className={styles.calculationTotalValue}>€750</span>
                  </div>
                </div>
                <div className={styles.exampleInfo}>
                  <p>
                    Suitable for a standard 2-3 room apartment with normal furnishings.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.exampleCard}>
              <div className={styles.exampleHeader}>
                <h3>4+ Room House</h3>
                <div className={styles.exampleBadge}>Large Move</div>
              </div>
              <div className={styles.exampleImage}>
                <Image
                  src="/images/apartment.png"
                  alt="4+ room house"
                  width={50}
                  height={50}
                  className={styles.exampleIllustration}
                />
              </div>
              <div className={styles.exampleDetails}>
                <div className={styles.exampleCalculation}>
                  <div className={styles.calculationRow}>
                    <span className={styles.calculationLabel}>
                      Hourly rate per helper:
                    </span>
                    <span className={styles.calculationValue}>€50</span>
                  </div>
                  <div className={styles.calculationRow}>
                    <span className={styles.calculationLabel}>
                      Number of helpers:
                    </span>
                    <span className={styles.calculationValue}>4</span>
                  </div>
                  <div className={styles.calculationRow}>
                    <span className={styles.calculationLabel}>
                      Estimated hours:
                    </span>
                    <span className={styles.calculationValue}>7</span>
                  </div>
                  <div className={styles.calculationTotal}>
                    <span className={styles.calculationLabel}>
                      Total price:
                    </span>
                    <span className={styles.calculationTotalValue}>€1,400</span>
                  </div>
                </div>
                <div className={styles.exampleInfo}>
                  <p>For larger houses with more furniture and possessions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services Section with modern design */}
      <section className={styles.additionalSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>ADDITIONAL SERVICES</span>
            <h2>Additional Services</h2>
            <p>
              Some moving companies offer additional services that can affect the final price.
            </p>
          </div>

          <div className={styles.servicesList}>
            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>
                <Image
                  src="/images/packing-icon.png"
                  alt="Packing service"
                  width={48}
                  height={48}
                />
              </div>
              <div className={styles.serviceContent}>
                <h3>Packing Service</h3>
                <p>Professional packing of your belongings for additional security.</p>
                <div className={styles.servicePrice}>
                  <span className={styles.priceLabel}>Average cost:</span>
                  <span className={styles.priceValue}>
                    €30-40 per hour per helper
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>
                <Image
                  src="/images/special.png"
                  alt="Special items"
                  width={48}
                  height={48}
                />
              </div>
              <div className={styles.serviceContent}>
                <h3>Special Items</h3>
                <p>
                  Transport of large or delicate items such as pianos, artwork, or aquariums.
                </p>
                <div className={styles.servicePrice}>
                  <span className={styles.priceLabel}>Average cost:</span>
                  <span className={styles.priceValue}>€100-300 per item</span>
                </div>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>
                <Image
                  src="/images/furniture.png"
                  alt="Furniture assembly"
                  width={48}
                  height={48}
                />
              </div>
              <div className={styles.serviceContent}>
                <h3>Furniture Assembly/Disassembly</h3>
                <p>
                  Taking apart and reassembling your furniture during the move.
                </p>
                <div className={styles.servicePrice}>
                  <span className={styles.priceLabel}>Average cost:</span>
                  <span className={styles.priceValue}>
                    Included in hourly rate
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>
                <Image
                  src="/images/cleaning.png"
                  alt="Cleaning services"
                  width={48}
                  height={48}
                />
              </div>
              <div className={styles.serviceContent}>
                <h3>Cleaning Services</h3>
                <p>Cleaning your old or new apartment after/before the move.</p>
                <div className={styles.servicePrice}>
                  <span className={styles.priceLabel}>Average cost:</span>
                  <span className={styles.priceValue}>
                    €20-30 per hour per cleaner
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.servicesNote}>
            <p>
              These services are offered directly by the moving companies and may vary.
              Please discuss any additional services you need when booking your move.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section with improved accordion style */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>FAQ</span>
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions about our pricing.</p>
          </div>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                What happens if my move takes longer than estimated?
                <svg className={styles.faqArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className={styles.faqAnswer}>
                <p>
                  If your move takes longer than estimated, you will be charged for the additional time
                  at the same hourly rate. The movers will ask for your permission before working beyond
                  the estimated time.
                </p>
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                What happens if my move is completed faster than estimated?
                <svg className={styles.faqArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className={styles.faqAnswer}>
                <p>
                  Good news! If your move is completed faster than estimated, you only pay for the time
                  actually spent on the move. Our goal is to be efficient while ensuring quality.
                </p>
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                Are there any additional fees I should know about?
                <svg className={styles.faqArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className={styles.faqAnswer}>
                <p>
                  Our pricing model is designed to be transparent without hidden fees.
                  However, there may be additional costs for special circumstances, such as:
                </p>
                <ul>
                  <li>
                    Long carrying distances (if the truck cannot park close to your house)
                  </li>
                  <li>
                    Stair or elevator fees (if no elevator is available or it is out of order)
                  </li>
                  <li>Storage fees (if your items need to be stored temporarily)</li>
                  <li>Special items that require special handling</li>
                </ul>
                <p>
                  These potential costs will be discussed and agreed upon before your move begins.
                </p>
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                Is insurance included in the price?
                <svg className={styles.faqArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className={styles.faqAnswer}>
                <p>
                  Basic insurance is included in the price and covers damages up to a certain amount.
                  If you have valuable items, you should consider additional insurance, which can be
                  arranged with the moving company.
                </p>
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                Do I need to make a deposit?
                <svg className={styles.faqArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className={styles.faqAnswer}>
                <p>
                  This depends on the policy of the moving company. Some companies require a small
                  deposit to secure your booking, others do not. Any required deposit will be clearly
                  communicated when confirming your booking.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section with improved call-to-action */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <span className={styles.ctaTag}>START NOW</span>
            <h2>Ready for your move?</h2>
            <p>
              Get free quotes from verified moving companies in your area.
              Our transparent pricing ensures you know exactly what you're paying for.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/quote" className={styles.btnCta}>
                Get a free quote
              </Link>
              <Link href="/contact" className={styles.btnCtaOutline}>
                Contact us
              </Link>
            </div>
          </div>
          <div className={styles.ctaImage}>
            <Image
              src="/images/moving-van.png"
              alt="Moving van"
              width={100}
              height={100}
              className={styles.ctaIllustration}
            />
          </div>
        </div>
      </section>
    </div>
  );
}