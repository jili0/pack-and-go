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
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1>Simple, Transparent Pricing</h1>
            <p className={styles.heroText}>
              Our pricing model is designed to be clear and straightforward. No
              hidden costs, no complex calculations - just pay for the time and
              number of helpers you need.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Model Section */}
      <section className={styles.pricingModelSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>How Our Pricing Works</h2>
            <p>
              At Pack & Go, we believe in transparency. Our pricing model is
              simple and fair, based on the time needed and the number of
              helpers required for your move.
            </p>
          </div>

          <div className={styles.pricingCards}>
            <div className={styles.pricingCard}>
              <div className={styles.pricingCardIcon}>
                <Image
                  src="/images/hourly-rate-icon.svg"
                  alt="Hourly Rate"
                  width={64}
                  height={64}
                />
              </div>
              <h3>Hourly Rate</h3>
              <p>
                Each moving company sets their own hourly rate per helper,
                typically ranging from €40 to €60.
              </p>
            </div>

            <div className={styles.pricingCard}>
              <div className={styles.pricingCardIcon}>
                <Image
                  src="/images/helpers-icon.svg"
                  alt="Number of Helpers"
                  width={64}
                  height={64}
                />
              </div>
              <h3>Number of Helpers</h3>
              <p>
                You choose how many movers you need (minimum 2). More helpers
                may reduce the total time needed.
              </p>
            </div>

            <div className={styles.pricingCard}>
              <div className={styles.pricingCardIcon}>
                <Image
                  src="/images/time-icon.svg"
                  alt="Estimated Hours"
                  width={64}
                  height={64}
                />
              </div>
              <h3>Estimated Hours</h3>
              <p>
                You estimate how long your move will take. The final price is
                based on actual time spent.
              </p>
            </div>
          </div>

          <div className={styles.pricingFormula}>
            <div className={styles.formulaBox}>
              <h3>The Formula</h3>
              <div className={styles.formula}>
                <span className={styles.formulaElement}>Hourly Rate</span>
                <span className={styles.formulaOperator}>×</span>
                <span className={styles.formulaElement}>Number of Helpers</span>
                <span className={styles.formulaOperator}>×</span>
                <span className={styles.formulaElement}>Estimated Hours</span>
                <span className={styles.formulaOperator}>=</span>
                <span className={styles.formulaResult}>Total Price</span>
              </div>
            </div>
          </div>

          <div className={styles.pricingNote}>
            <div className={styles.noteIcon}>ℹ️</div>
            <div className={styles.noteText}>
              <p>
                <strong>Note:</strong> The final price may vary if the actual
                time needed differs from your estimate. You will only be charged
                for the actual time spent on your move.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Price Calculator Section */}
      <section className={styles.calculatorSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Calculate Your Moving Cost</h2>
            <p>Use our simple calculator to estimate the cost of your move.</p>
          </div>

          <div className={styles.calculatorContainer}>
            <PriceCalculator />
          </div>
        </div>
      </section>

      {/* Price Examples Section */}
      <section className={styles.examplesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Price Examples</h2>
            <p>
              Here are some common moving scenarios to give you an idea of
              costs.
            </p>
          </div>

          <div className={styles.exampleCards}>
            <div className={styles.exampleCard}>
              <div className={styles.exampleHeader}>
                <h3>Studio Apartment</h3>
                <div className={styles.exampleBadge}>Small Move</div>
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
                    Ideal for a studio or 1-bedroom apartment with minimal
                    furniture.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.exampleCard}>
              <div className={styles.exampleHeader}>
                <h3>2-3 Bedroom Apartment</h3>
                <div className={styles.exampleBadge}>Medium Move</div>
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
                    Suitable for a standard 2-3 bedroom apartment with regular
                    furniture.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.exampleCard}>
              <div className={styles.exampleHeader}>
                <h3>4+ Bedroom House</h3>
                <div className={styles.exampleBadge}>Large Move</div>
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
                  <p>For larger homes with more furniture and belongings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className={styles.additionalSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Additional Services</h2>
            <p>
              Some moving companies offer additional services that may affect
              the final price.
            </p>
          </div>

          <div className={styles.servicesList}>
            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>📦</div>
              <div className={styles.serviceContent}>
                <h3>Packing Services</h3>
                <p>Professional packing of your belongings for extra safety.</p>
                <p className={styles.servicePrice}>
                  <span className={styles.priceLabel}>Average Cost:</span>
                  <span className={styles.priceValue}>
                    €30-40 per hour per helper
                  </span>
                </p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>🚚</div>
              <div className={styles.serviceContent}>
                <h3>Special Items</h3>
                <p>
                  Moving of large or delicate items like pianos, artworks, or
                  aquariums.
                </p>
                <p className={styles.servicePrice}>
                  <span className={styles.priceLabel}>Average Cost:</span>
                  <span className={styles.priceValue}>€100-300 per item</span>
                </p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>🏗️</div>
              <div className={styles.serviceContent}>
                <h3>Furniture Assembly/Disassembly</h3>
                <p>
                  Taking apart and reassembling your furniture during the move.
                </p>
                <p className={styles.servicePrice}>
                  <span className={styles.priceLabel}>Average Cost:</span>
                  <span className={styles.priceValue}>
                    Included in hourly rate
                  </span>
                </p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>🧹</div>
              <div className={styles.serviceContent}>
                <h3>Cleaning Services</h3>
                <p>Cleaning of your old or new home after/before the move.</p>
                <p className={styles.servicePrice}>
                  <span className={styles.priceLabel}>Average Cost:</span>
                  <span className={styles.priceValue}>
                    €20-30 per hour per cleaner
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className={styles.servicesNote}>
            <p>
              These services are offered directly by the moving companies and
              may vary. Please discuss any additional services you need when
              booking your move.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions about our pricing.</p>
          </div>

          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>What happens if my move takes longer than estimated?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  If your move takes longer than estimated, you will be charged
                  for the additional time at the same hourly rate. The movers
                  will ask for your permission before extending beyond the
                  estimated time.
                </p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <h3>What if my move is completed faster than estimated?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  Great news! If your move is completed faster than estimated,
                  you will only be charged for the actual time spent on the
                  move. Our goal is to be efficient while maintaining quality.
                </p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <h3>Are there any additional fees I should know about?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  Our pricing model is designed to be transparent with no hidden
                  fees. However, there might be additional charges for special
                  circumstances such as:
                </p>
                <ul>
                  <li>
                    Long carry distances (if the truck cannot park close to your
                    home)
                  </li>
                  <li>
                    Stairs or elevator fees (if there's no elevator or it's out
                    of service)
                  </li>
                  <li>Storage fees (if your items need temporary storage)</li>
                  <li>Specialty items that require special handling</li>
                </ul>
                <p>
                  These potential charges will be discussed and agreed upon
                  before your move begins.
                </p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <h3>Is insurance included in the price?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  Basic insurance is included in the price, covering damages up
                  to a certain amount. Companies with KisteKlar certification
                  offer enhanced insurance coverage. If you have valuable items,
                  you may want to consider additional insurance coverage, which
                  can be arranged with the moving company.
                </p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <h3>Do I need to pay a deposit?</h3>
              <div className={styles.faqAnswer}>
                <p>
                  This depends on the moving company's policy. Some companies
                  require a small deposit to secure your booking, while others
                  don't. Any required deposit will be clearly communicated when
                  you confirm your booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Ready to Plan Your Move?</h2>
            <p>
              Get free quotes from verified moving companies in your area. Our
              transparent pricing ensures you know exactly what you're paying
              for.
            </p>
            <div className={styles.ctaButton}>
              <Link href="/" className={styles.btnPrimary}>
                Get Moving Quotes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
