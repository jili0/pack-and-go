import Image from '@/components/ui/Image';
import Link from 'next/link';
import styles from '@/app/styles/Tips.module.css';

export const metadata = {
  title: 'Moving Tips | Pack & Go',
  description: 'Helpful tips and tricks for a stress-free and efficient move with Pack & Go'
};

export default function MovingTips() {
  return (
    <div className={styles.contentPage}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Moving Tips</h1>
          <p className={styles.subtitle}>
            Make your move smooth and stress-free with our professional moving tips
          </p>
        </div>
      </section>
      
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.tipsIntro}>
            <div className={styles.introText}>
              <h2>Plan Ahead for a Successful Move</h2>
              <p>
                Moving to a new home can be exciting, but it's also one of life's most stressful 
                events. With proper planning and organization, you can make your move much easier. 
                Here are our top tips to help you prepare for and execute a successful move.
              </p>
            </div>
            <div className={styles.introImage}>
              <Image
                src="/images/moving-planning.jpg"
                alt="Woman preparing a move"
                width={400}
                height={300}
                className={styles.roundedImage}
              />
            </div>
          </div>
          
          <div className={styles.timelineSection}>
            <h2>Moving Timeline: When to Do What</h2>
            
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineBadge}>8 Weeks</div>
                <div className={styles.timelineContent}>
                  <h3>Two Months Before</h3>
                  <ul className={styles.tipsList}>
                    <li>Research moving companies and get quotes</li>
                    <li>Begin decluttering - decide what to keep, sell, or donate</li>
                    <li>Start collecting free boxes from local stores</li>
                  </ul>
                </div>
              </div>
              
              <div className={styles.timelineItem}>
                <div className={styles.timelineBadge}>6 Weeks</div>
                <div className={styles.timelineContent}>
                  <h3>Six Weeks Before</h3>
                  <ul className={styles.tipsList}>
                    <li>Book your moving company through Pack & Go</li>
                    <li>Start using up frozen and pantry items</li>
                    <li>Begin collecting packing supplies (boxes, tape, bubble wrap)</li>
                  </ul>
                </div>
              </div>
              
              <div className={styles.timelineItem}>
                <div className={styles.timelineBadge}>4 Weeks</div>
                <div className={styles.timelineContent}>
                  <h3>One Month Before</h3>
                  <ul className={styles.tipsList}>
                    <li>File change of address with the post office</li>
                    <li>Notify bank, employer, and insurance of address change</li>
                    <li>Transfer utilities to your new address</li>
                  </ul>
                </div>
              </div>
              
              <div className={styles.timelineItem}>
                <div className={styles.timelineBadge}>2 Weeks</div>
                <div className={styles.timelineContent}>
                  <h3>Two Weeks Before</h3>
                  <ul className={styles.tipsList}>
                    <li>Confirm your moving date with Pack & Go</li>
                    <li>Continue packing room by room</li>
                    <li>Clean out refrigerator and defrost freezer</li>
                  </ul>
                </div>
              </div>
              
              <div className={styles.timelineItem}>
                <div className={styles.timelineBadge}>1 Week</div>
                <div className={styles.timelineContent}>
                  <h3>One Week Before</h3>
                  <ul className={styles.tipsList}>
                    <li>Pack a suitcase with essentials for first few days</li>
                    <li>Finish most of your packing</li>
                    <li>Disassemble furniture that needs to be taken apart</li>
                  </ul>
                </div>
              </div>
              
              <div className={styles.timelineItem}>
                <div className={styles.timelineBadge}>Moving Day</div>
                <div className={styles.timelineContent}>
                  <h3>Moving Day</h3>
                  <ul className={styles.tipsList}>
                    <li>Keep important documents and valuables with you</li>
                    <li>Do a final walkthrough of your old home</li>
                    <li>Check all closets and drawers for forgotten items</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.tipsGrid}>
            <h2>Expert Packing Tips</h2>
            
            <div className={styles.gridContainer}>
              <div className={styles.gridItem}>
                <div className={styles.iconContainer}>
                  <span className={styles.icon}>📦</span>
                </div>
                <h3>Start Early</h3>
                <p>
                  Begin packing at least 3 weeks before your move. Start with items you rarely use and 
                  seasonal items. Packing a little bit each day will make the process less overwhelming.
                </p>
              </div>
              
              <div className={styles.gridItem}>
                <div className={styles.iconContainer}>
                  <span className={styles.icon}>📋</span>
                </div>
                <h3>Label Everything</h3>
                <p>
                  Clearly label each box with its contents and the room it belongs to. Consider using a 
                  color-coding system for easy identification. Take photos of complex electronic setups 
                  before dismantling.
                </p>
              </div>
              
              <div className={styles.gridItem}>
                <div className={styles.iconContainer}>
                  <span className={styles.icon}>🧰</span>
                </div>
                <h3>Pack an Essentials Box</h3>
                <p>
                  Prepare a box with essentials you'll need immediately upon arrival: toilet paper, 
                  medications, basic tools, phone chargers, toiletries, change of clothes, and basic 
                  kitchen items.
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.tipsWithImage}>
            <div className={styles.tipImageWrapper}>
              <h2>Moving Day Survival Tips</h2>
              <div className={styles.tipImage}>
                <Image
                  src="/images/moving-day.jpg"
                  alt="Moving day with boxes and movers"
                  width={500}
                  height={350}
                  className={styles.roundedImage}
                />
              </div>
            </div>
            <div className={styles.tipContent}>
              <ul className={styles.detailedList}>
                <li>
                  <h4>Start Early</h4>
                  <p>Begin your moving day as early as possible to maximize daylight hours, especially if you're moving in winter.</p>
                </li>
                <li>
                  <h4>Prepare for the Weather</h4>
                  <p>Check the forecast and prepare accordingly. Have tarps, umbrellas, and towels ready in case of rain.</p>
                </li>
                <li>
                  <h4>Keep Children and Pets Safe</h4>
                  <p>Arrange for children and pets to stay with friends or family during the move to keep them safe and reduce stress.</p>
                </li>
                <li>
                  <h4>Stay Hydrated and Fed</h4>
                  <p>Prepare a cooler with water, snacks, and sandwiches to keep everyone energized throughout the day.</p>
                </li>
              </ul>
            </div>
          </div>
          
          <div className={styles.faqSection}>
            <h2>Frequently Asked Questions</h2>
            
            <div className={styles.faqItem}>
              <h3>How far in advance should I book movers?</h3>
              <p>
                It's best to book movers at least 4-6 weeks in advance, especially during peak moving 
                season (May through September). For moves during these busy times, consider booking 
                8 weeks ahead.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>What items can't be transported by movers?</h3>
              <p>
                Most moving companies won't transport hazardous materials, perishable items, plants, 
                highly valuable items, or certain personal items. These typically include cleaning supplies, 
                paint, gasoline, propane tanks, ammunition, and aerosol cans. Always ask your moving 
                company about their specific policies.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>How do I estimate how many boxes I'll need?</h3>
              <p>
                As a general guideline, for a one-bedroom apartment, you'll need approximately 30-40 boxes. 
                For a two-bedroom home, plan for 40-50 boxes, and for a three-bedroom home, you'll likely 
                need 60-70 boxes. These numbers can vary based on how many possessions you have.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>Should I tip the movers?</h3>
              <p>
                Tipping is not required but is appreciated for good service. A common guideline is 
                €5-10 per hour per mover for a standard move, or 5-10% of the total moving cost for 
                larger moves. Consider tipping more for exceptional service or if the move involved 
                special challenges like stairs or heavy items.
              </p>
            </div>
          </div>
          
          <div className={styles.ctaSection}>
            <h2>Ready to Plan Your Move?</h2>
            <p>
              Let Pack & Go help you find trusted, professional movers for your upcoming relocation.
              Our transparent pricing and verified companies make moving easier than ever.
            </p>
            <Link href="/" className={styles.ctaButton}>
              Get Moving Quotes Now
            </Link>
          </div>
          
          <div className={styles.resourcesSection}>
            <h2>Additional Resources</h2>
            <div className={styles.resourceLinks}>
              <Link href="/checklist" className={styles.resourceLink}>
                <span className={styles.resourceIcon}>📋</span>
                <span className={styles.resourceText}>Comprehensive Moving Checklist</span>
              </Link>
              <Link href="/pricing" className={styles.resourceLink}>
                <span className={styles.resourceIcon}>💰</span>
                <span className={styles.resourceText}>Understanding Moving Costs</span>
              </Link>
              <Link href="/guide" className={styles.resourceLink}>
                <span className={styles.resourceIcon}>ℹ️</span>
                <span className={styles.resourceText}>How Pack & Go Works</span>
              </Link>
              <Link href="/contact" className={styles.resourceLink}>
                <span className={styles.resourceIcon}>📞</span>
                <span className={styles.resourceText}>Contact Our Moving Experts</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}