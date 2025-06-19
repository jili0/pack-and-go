// src/app/search-results/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/ui/Image";

export default function SearchResults() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("rating");
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Inline components
  const CheckIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const ArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7.70711 14.7071C7.31658 15.0976 6.68342 15.0976 6.29289 14.7071L2.29289 10.7071C1.90237 10.3166 1.90237 9.68342 2.29289 9.29289L6.29289 5.29289C6.68342 4.90237 7.31658 4.90237 7.70711 5.29289C8.09763 5.68342 8.09763 6.31658 7.70711 6.70711L5.41421 9H17C17.5523 9 18 9.44772 18 10C18 10.5523 17.5523 11 17 11H5.41421L7.70711 13.2929C8.09763 13.6834 8.09763 14.3166 7.70711 14.7071Z" />
    </svg>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedFormData = sessionStorage.getItem("movingFormData");
        const savedResults = sessionStorage.getItem("searchResults");

        if (!savedFormData || !savedResults) {
          router.push("/");
          return;
        }

        setFormData(JSON.parse(savedFormData));
        setCompanies(JSON.parse(savedResults));
      } catch (error) {
        setError(`Search results could not be loaded: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const filteredAndSortedCompanies = companies
    .filter((company) => {
      if (
        !company.serviceAreas ||
        !formData?.fromAddress?.city ||
        !formData?.toAddress?.city
      )
        return true;
      return company.serviceAreas.some(
        (area) =>
          area.from
            .toLowerCase()
            .includes(formData.fromAddress.city.toLowerCase()) &&
          area.to.toLowerCase().includes(formData.toAddress.city.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (
        sortBy === "certified" &&
        a.isKisteKlarCertified !== b.isKisteKlarCertified
      ) {
        return a.isKisteKlarCertified ? -1 : 1;
      }
      return b.averageRating - a.averageRating;
    });

  const handleAction = (action, data = null) => {
    try {
      if (action === "select") setSelectedCompany(data);
      else if (action === "confirm") {
        sessionStorage.setItem(
          "selectedCompany",
          JSON.stringify(selectedCompany)
        );
        router.push("/order/create");
      } else if (action === "cancel") setSelectedCompany(null);
      else router.push("/");
    } catch (error) {
      setError(`Action failed: ${error.message}`);
    }
  };

  if (loading)
    return (
      <main>
        <h2>Loading moving companies...</h2>
        <p>Please wait a moment.</p>
      </main>
    );

  if (error)
    return (
      <main>
        ⚠️
        <h2>An error occurred</h2>
        <p>{error}</p>
        <button onClick={() => handleAction("home")}>Back to Home</button>
      </main>
    );

  return (
    <main>
      <h1>Moving Companies Found</h1>
      <p>
        From {formData?.fromAddress?.city || "Start location"} to{" "}
        {formData?.toAddress?.city || "Destination"}
      </p>

      <section>
        <h2>{filteredAndSortedCompanies.length} moving companies found</h2>
        <p>
          For {formData?.estimatedHours || 0} hours with{" "}
          {formData?.helpersCount || 0} helpers
        </p>
        <label>
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Best Rating</option>
            <option value="certified">KisteKlar Certified</option>
          </select>
        </label>
      </section>

      {filteredAndSortedCompanies.length > 0 ? (
        filteredAndSortedCompanies.map((company) => (
          <article key={company._id}>
            <header>
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={`${company.companyName} Logo`}
                  width={64}
                  height={64}
                />
              ) : (
                <div>{company.companyName.charAt(0)}</div>
              )}
              <div>
                <h3>{company.companyName}</h3>
                <div>
                  <span>
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </span>
                  <span>
                    ({company.reviewsCount}{" "}
                    {company.reviewsCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>
              {company.isKisteKlarCertified && (
                <div>
                  <CheckIcon /> KisteKlar Certified
                </div>
              )}
            </header>

            {company.description && (
              <div>
                <h4>Description</h4>
                <p>{company.description}</p>
              </div>
            )}

            {company.serviceAreas?.length > 0 && (
              <div>
                <h4>Service Areas</h4>
                {company.serviceAreas.map((area, index) => (
                  <span key={index}>
                    {area.from} → {area.to}
                  </span>
                ))}
              </div>
            )}

            <button onClick={() => handleAction("select", company)}>
              Select Company
            </button>
          </article>
        ))
      ) : (
        <div>
          🔍
          <h3>No Moving Companies Found</h3>
          <p>
            Unfortunately, no matching moving companies were found for your
            request. Try different start or destination locations.
          </p>
          <button onClick={() => handleAction("home")}>Start New Search</button>
        </div>
      )}

      <button onClick={() => handleAction("home")}>
        <ArrowIcon /> Back to Home
      </button>

      {selectedCompany && (
        <div
          onClick={(e) =>
            e.target === e.currentTarget && handleAction("cancel")
          }
        >
          <div>
            <h3>Select Moving Company</h3>
            <p>Would you like to select the following moving company?</p>

            <div>
              <h4>{selectedCompany.companyName}</h4>
              <div>
                <span>{selectedCompany.averageRating.toFixed(1)}</span>
                <span>•</span>
                <span>{selectedCompany.reviewsCount} reviews</span>
                {selectedCompany.isKisteKlarCertified && (
                  <>
                    <span>•</span>
                    <span>
                      <CheckIcon /> KisteKlar certified
                    </span>
                  </>
                )}
              </div>
            </div>

            <div>
              <span>Estimated Price:</span>
              <span>
                {formData
                  ? 50 * formData.helpersCount * formData.estimatedHours
                  : 0}{" "}
                €
              </span>
              <p>
                Based on {formData?.helpersCount || 2} helpers for{" "}
                {formData?.estimatedHours || 4} hours
              </p>
            </div>

            <div>
              <button onClick={() => handleAction("cancel")}>Cancel</button>
              <button onClick={() => handleAction("confirm")}>
                Select and Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
