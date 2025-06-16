import MovingCalculator from "@/components/forms/PriceCalculator";
import SearchForm from "@/components/forms/SearchForm";
import "@/app/styles/styles.css";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Easy moving with transparent prices</h1>
          <p>Find certified moving helpers at fair prices.</p>
          <a href="#pricing" className="btn-primary">
            Calculate price
          </a>
        </div>
        <div className="hero-image">
          <img src="/images/moving-planning.jpg" alt="Moving Planning" />
        </div>
      </section>

      {/* Price Calculator */}
      <section id="pricing">
        <div className="container">
          <h2>Calculate your moving price</h2>
          <MovingCalculator />
        </div>
      </section>

      {/* Search Section */}
      <section id="searchCompanies">
        <div>
          <div>
            <h2>Find moving companies</h2>
            <p>
              Enter your moving route to discover the best moving companies in
              your area
            </p>
          </div>
          <SearchForm />
        </div>
      </section>

      {/* Contact Info */}
      <section id="contact">
        <div className="container">
          <h2>Contact Information</h2>
          <p>
            Get in touch with us through any of these channels. We're always
            ready to help!
          </p>

          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div>
                <h4>Email Us</h4>
                <p>hello@pack-and-go.com</p>
                <p>We reply within 24 hours</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div>
                <h4>Call Us</h4>
                <p>+49 30 123456789</p>
                <p>Mon-Fri 8AM to 6PM CET</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <h4>Visit Us</h4>
                <p>Berliner Str. 123</p>
                <p>10115 Berlin, Germany</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
              </div>
              <div>
                <h4>Business Hours</h4>
                <p>Monday - Friday: 8AM - 6PM</p>
                <p>Saturday: 9AM - 4PM</p>
                <p>Closed on Sundays</p>
              </div>
            </div>
          </div>

          <div className="social-links">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
