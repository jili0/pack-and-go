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

  const matchesServiceArea = (company, fromCity, toCity) => {
    if (!company.serviceAreas || !fromCity || !toCity) return true;
    return company.serviceAreas.some(
      (area) =>
        area.from.toLowerCase().includes(fromCity.toLowerCase()) &&
        area.to.toLowerCase().includes(toCity.toLowerCase())
    );
  };

  const filteredAndSortedCompanies = companies
    .filter((company) =>
      matchesServiceArea(
        company,
        formData?.fromAddress?.city,
        formData?.toAddress?.city
      )
    )
    .sort((a, b) => {
      if (sortBy === "certified") {
        if (a.isKisteKlarCertified !== b.isKisteKlarCertified) {
          return a.isKisteKlarCertified ? -1 : 1;
        }
      }
      return b.averageRating - a.averageRating;
    });

  const handleAction = (action, data = null) => {
    try {
      switch (action) {
        case "select":
          setSelectedCompany(data);
          break;
        case "confirm":
          sessionStorage.setItem(
            "selectedCompany",
            JSON.stringify(selectedCompany)
          );
          router.push("/order/create");
          break;
        case "cancel":
          setSelectedCompany(null);
          break;
        default:
          router.push("/");
      }
    } catch (error) {
      setError(`Action failed: ${error.message}`);
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => <span key={i}>★</span>);

  const renderCertificationBadge = () => (
    <div>
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
      KisteKlar Certified
    </div>
  );

  const renderServiceAreas = (serviceAreas) => (
    <div>
      <h4>Service Areas</h4>
      <div>
        {serviceAreas.map((area, index) => (
          <span key={index}>
            {area.from} → {area.to}
          </span>
        ))}
      </div>
    </div>
  );

  if (loading)
    return (
      <div>
        <h2>Loading moving companies...</h2>
        <p>Please wait a moment.</p>
      </div>
    );

  if (error)
    return (
      <div>
        <div>⚠️</div>
        <h2>An error occurred</h2>
        <p>{error}</p>
        <button onClick={() => handleAction("home")}>Back to Home</button>
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div>
        <h1>Moving Companies Found</h1>
        <p>
          From {formData?.fromAddress?.city || "Start location"} to{" "}
          {formData?.toAddress?.city || "Destination"}
        </p>
      </div>

      {/* Filter Bar */}
      <div>
        <div>
          <h2>{filteredAndSortedCompanies.length} moving companies found</h2>
          <p>
            For {formData?.estimatedHours || 0} hours with{" "}
            {formData?.helpersCount || 0} helpers
          </p>
        </div>
        <div>
          <span>Sort by:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Best Rating</option>
            <option value="certified">KisteKlar Certified</option>
          </select>
        </div>
      </div>

      {/* Companies List */}
      <div>
        {filteredAndSortedCompanies.length > 0 ? (
          filteredAndSortedCompanies.map((company) => (
            <div key={company._id}>
              {/* Company Header */}
              <div>
                <div>
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={`${company.companyName} Logo`}
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div>
                      <span>{company.companyName.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3>{company.companyName}</h3>
                    <div>
                      <div>{renderStars(company.averageRating)}</div>
                      <span>
                        ({company.reviewsCount}{" "}
                        {company.reviewsCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  </div>
                </div>
                {company.isKisteKlarCertified && renderCertificationBadge()}
              </div>

              {/* Company Details */}
              <div>
                {company.description && (
                  <div>
                    <h4>Description</h4>
                    <p>{company.description}</p>
                  </div>
                )}
                {company.serviceAreas?.length > 0 &&
                  renderServiceAreas(company.serviceAreas)}
                <button onClick={() => handleAction("select", company)}>
                  Select Company
                </button>
              </div>
            </div>
          ))
        ) : (
          <div>
            <div>🔍</div>
            <h3>No Moving Companies Found</h3>
            <p>
              Unfortunately, no matching moving companies were found for your
              request. Try different start or destination locations.
            </p>
            <button onClick={() => handleAction("home")}>
              Start New Search
            </button>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div>
        <button onClick={() => handleAction("home")}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.70711 14.7071C7.31658 15.0976 6.68342 15.0976 6.29289 14.7071L2.29289 10.7071C1.90237 10.3166 1.90237 9.68342 2.29289 9.29289L6.29289 5.29289C6.68342 4.90237 7.31658 4.90237 7.70711 5.29289C8.09763 5.68342 8.09763 6.31658 7.70711 6.70711L5.41421 9H17C17.5523 9 18 9.44772 18 10C18 10.5523 17.5523 11 17 11H5.41421L7.70711 13.2929C8.09763 13.6834 8.09763 14.3166 7.70711 14.7071Z" />
          </svg>
          Back to Home
        </button>
      </div>

      {/* Confirmation Modal */}
      {selectedCompany && (
        <div
          onClick={(e) =>
            e.target === e.currentTarget && handleAction("cancel")
          }
        >
          <div>
            <div>
              <h3>Select Moving Company</h3>
            </div>
            <div>
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
                        <svg
                          width="14"
                          height="14"
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
                        KisteKlar certified
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <div>
                  <span>Estimated Price:</span>
                  <span>
                    {formData
                      ? 50 * formData.helpersCount * formData.estimatedHours
                      : 0}{" "}
                    €
                  </span>
                </div>
                <p>
                  Based on {formData?.helpersCount || 2} helpers for{" "}
                  {formData?.estimatedHours || 4} hours
                </p>
              </div>
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
    </div>
  );
}
