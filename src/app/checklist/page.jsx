// src/app/checklist/page.jsx
import Image from '@/components/ui/Image';
import Link from 'next/link';
import styles from '@/app/styles/Checklist.module.css';

export const metadata = {
  title: 'Moving Checklist | Pack & Go',
  description: 'A comprehensive checklist to help you prepare for your move - from weeks before to moving day.',
};

const ChecklistPage = () => {
  return (
    <div className={styles.checklistContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Moving Checklist</h1>
          <p>Stay organized with our comprehensive moving checklist</p>
        </div>
      </section>

      <section className={styles.introSection}>
        <div className={styles.container}>
          <div className={styles.introText}>
            <h2>Your Ultimate Moving Preparation Guide</h2>
            <p>
              Moving can be one of life's most stressful events, but with proper planning and organization, 
              you can make the process smoother. Our comprehensive checklist will help you keep track of 
              everything you need to do before, during, and after your move.
            </p>
            <div className={styles.downloadBox}>
              <h3>Want to take this checklist with you?</h3>
              <p>Download our printable PDF version to check off items as you complete them.</p>
              <a href="/downloads/moving-checklist.pdf" download className={styles.downloadBtn}>
                Download PDF Checklist
              </a>
            </div>
          </div>
          <div className={styles.introImage}>
            <Image 
              src="/images/checklist-planning.jpg"
              alt="Person checking items on a moving checklist" 
              width={500} 
              height={350}
              className={styles.featureImage}
            />
          </div>
        </div>
      </section>

      <section className={styles.checklistSection}>
        <div className={styles.container}>
          <div className={styles.timeline}>
            {/* 8 Weeks Before */}
            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>8 Weeks</div>
              <div className={styles.timelineContent}>
                <h3>8 Weeks Before Moving</h3>
                <ul className={styles.checkItems}>
                  <li>
                    <input type="checkbox" id="item-1" className={styles.checkboxInput} />
                    <label htmlFor="item-1" className={styles.checkboxLabel}>
                      Research moving companies and get multiple quotes
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-2" className={styles.checkboxInput} />
                    <label htmlFor="item-2" className={styles.checkboxLabel}>
                      Create a moving budget to track all expenses
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-3" className={styles.checkboxInput} />
                    <label htmlFor="item-3" className={styles.checkboxLabel}>
                      Start a home inventory of items to move, donate, or sell
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-4" className={styles.checkboxInput} />
                    <label htmlFor="item-4" className={styles.checkboxLabel}>
                      Research your new neighborhood (schools, healthcare, utilities)
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-5" className={styles.checkboxInput} />
                    <label htmlFor="item-5" className={styles.checkboxLabel}>
                      If moving long distance, arrange for housing in your new location
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            {/* 6 Weeks Before */}
            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>6 Weeks</div>
              <div className={styles.timelineContent}>
                <h3>6 Weeks Before Moving</h3>
                <ul className={styles.checkItems}>
                  <li>
                    <input type="checkbox" id="item-6" className={styles.checkboxInput} />
                    <label htmlFor="item-6" className={styles.checkboxLabel}>
                      Book your moving company through Pack & Go
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-7" className={styles.checkboxInput} />
                    <label htmlFor="item-7" className={styles.checkboxLabel}>
                      Begin collecting free moving boxes from local stores
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-8" className={styles.checkboxInput} />
                    <label htmlFor="item-8" className={styles.checkboxLabel}>
                      Start decluttering and organizing your belongings
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-9" className={styles.checkboxInput} />
                    <label htmlFor="item-9" className={styles.checkboxLabel}>
                      Plan a garage sale or list items for sale online
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-10" className={styles.checkboxInput} />
                    <label htmlFor="item-10" className={styles.checkboxLabel}>
                      Request time off work for moving day if needed
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4 Weeks Before */}
            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>4 Weeks</div>
              <div className={styles.timelineContent}>
                <h3>4 Weeks Before Moving</h3>
                <ul className={styles.checkItems}>
                  <li>
                    <input type="checkbox" id="item-11" className={styles.checkboxInput} />
                    <label htmlFor="item-11" className={styles.checkboxLabel}>
                      Start packing items you don't use regularly
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-12" className={styles.checkboxInput} />
                    <label htmlFor="item-12" className={styles.checkboxLabel}>
                      Purchase moving supplies (boxes, tape, bubble wrap, markers)
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-13" className={styles.checkboxInput} />
                    <label htmlFor="item-13" className={styles.checkboxLabel}>
                      Label boxes with contents and destination room
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-14" className={styles.checkboxInput} />
                    <label htmlFor="item-14" className={styles.checkboxLabel}>
                      Notify important parties of your address change (bank, insurance, etc.)
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-15" className={styles.checkboxInput} />
                    <label htmlFor="item-15" className={styles.checkboxLabel}>
                      Register your children at new schools if applicable
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            {/* 2 Weeks Before */}
            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>2 Weeks</div>
              <div className={styles.timelineContent}>
                <h3>2 Weeks Before Moving</h3>
                <ul className={styles.checkItems}>
                  <li>
                    <input type="checkbox" id="item-16" className={styles.checkboxInput} />
                    <label htmlFor="item-16" className={styles.checkboxLabel}>
                      Set up mail forwarding with the post office
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-17" className={styles.checkboxInput} />
                    <label htmlFor="item-17" className={styles.checkboxLabel}>
                      Transfer or cancel memberships (gym, library, etc.)
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-18" className={styles.checkboxInput} />
                    <label htmlFor="item-18" className={styles.checkboxLabel}>
                      Schedule disconnection of utilities at current home
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-19" className={styles.checkboxInput} />
                    <label htmlFor="item-19" className={styles.checkboxLabel}>
                      Schedule connection of utilities at new home
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-20" className={styles.checkboxInput} />
                    <label htmlFor="item-20" className={styles.checkboxLabel}>
                      Continue packing, focusing on non-essential items
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            {/* 1 Week Before */}
            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>1 Week</div>
              <div className={styles.timelineContent}>
                <h3>1 Week Before Moving</h3>
                <ul className={styles.checkItems}>
                  <li>
                    <input type="checkbox" id="item-21" className={styles.checkboxInput} />
                    <label htmlFor="item-21" className={styles.checkboxLabel}>
                      Confirm moving details with your Pack & Go moving company
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-22" className={styles.checkboxInput} />
                    <label htmlFor="item-22" className={styles.checkboxLabel}>
                      Pack a suitcase with essentials for the first few days
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-23" className={styles.checkboxInput} />
                    <label htmlFor="item-23" className={styles.checkboxLabel}>
                      Clean out refrigerator and pantry
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-24" className={styles.checkboxInput} />
                    <label htmlFor="item-24" className={styles.checkboxLabel}>
                      Take photos of electronics before disconnecting for easy setup
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-25" className={styles.checkboxInput} />
                    <label htmlFor="item-25" className={styles.checkboxLabel}>
                      Make a plan for moving day (parking, elevator reservations, etc.)
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            {/* Moving Day */}
            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>Day Of</div>
              <div className={styles.timelineContent}>
                <h3>Moving Day</h3>
                <ul className={styles.checkItems}>
                  <li>
                    <input type="checkbox" id="item-26" className={styles.checkboxInput} />
                    <label htmlFor="item-26" className={styles.checkboxLabel}>
                      Do a final walkthrough of your old home
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-27" className={styles.checkboxInput} />
                    <label htmlFor="item-27" className={styles.checkboxLabel}>
                      Check all closets, drawers, and cabinets for forgotten items
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-28" className={styles.checkboxInput} />
                    <label htmlFor="item-28" className={styles.checkboxLabel}>
                      Take meter readings at old and new homes
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-29" className={styles.checkboxInput} />
                    <label htmlFor="item-29" className={styles.checkboxLabel}>
                      Keep important documents and valuables with you
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-30" className={styles.checkboxInput} />
                    <label htmlFor="item-30" className={styles.checkboxLabel}>
                      Hand over keys to landlord or new owners
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            {/* After Moving */}
            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>After</div>
              <div className={styles.timelineContent}>
                <h3>After Moving</h3>
                <ul className={styles.checkItems}>
                  <li>
                    <input type="checkbox" id="item-31" className={styles.checkboxInput} />
                    <label htmlFor="item-31" className={styles.checkboxLabel}>
                      Unpack essentials first: bedroom, bathroom, kitchen
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-32" className={styles.checkboxInput} />
                    <label htmlFor="item-32" className={styles.checkboxLabel}>
                      Check for any damaged items and report to moving company
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-33" className={styles.checkboxInput} />
                    <label htmlFor="item-33" className={styles.checkboxLabel}>
                      Register with local authorities if required
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-34" className={styles.checkboxInput} />
                    <label htmlFor="item-34" className={styles.checkboxLabel}>
                      Update your address for any services missed earlier
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id="item-35" className={styles.checkboxInput} />
                    <label htmlFor="item-35" className={styles.checkboxLabel}>
                      Leave a review for your Pack & Go moving company
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.tipsSection}>
        <div className={styles.container}>
          <h2>Expert Moving Tips</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>📦</div>
              <h3>Packing Tips</h3>
              <ul>
                <li>Pack heavy items in small boxes, lightweight items in larger ones</li>
                <li>Don't leave empty spaces in boxes to prevent items from shifting</li>
                <li>Use clothing to wrap fragile items instead of buying bubble wrap</li>
                <li>Take photos of complex setups (like electronics) before disassembling</li>
              </ul>
            </div>
            
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>💰</div>
              <h3>Money-Saving Tips</h3>
              <ul>
                <li>Collect free boxes from local stores and supermarkets</li>
                <li>Move during off-peak season (October-April) if possible</li>
                <li>Declutter before moving to reduce the volume of items</li>
                <li>Compare quotes from different moving companies on Pack & Go</li>
              </ul>
            </div>
            
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🔧</div>
              <h3>Setup Tips</h3>
              <ul>
                <li>Set up your bed first when you arrive at your new home</li>
                <li>Unpack one room at a time, starting with the most essential</li>
                <li>Create a priority list of what needs to be done first</li>
                <li>Take measurements of doorways and stairs before moving large furniture</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Ready to Book Your Move?</h2>
            <p>Find reliable, verified moving companies in your area with transparent pricing.</p>
            <Link href="/" className={styles.ctaButton}>
              Plan Your Move Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChecklistPage;