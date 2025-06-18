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
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadSessionData = () => {
      try {
        if (typeof window === "undefined") {
          setError("Page not ready. Please refresh.");
          setLoading(false);
          return;
        }

        const savedFormData = sessionStorage.getItem("movingFormData");
        const savedResults = sessionStorage.getItem("searchResults");

        if (!savedFormData || !savedResults) {
          router.push("/");
          return;
        }

        const parsedFormData = JSON.parse(savedFormData);
        const parsedResults = JSON.parse(savedResults);

        setFormData(parsedFormData);
        setCompanies(parsedResults);
        setLoading(false);
      } catch (error) {
        setError(`The search results could not be loaded: ${error.message}`);
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadSessionData();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const sortedCompanies = [...companies].sort((a, b) => {
    if (sortBy === "rating") {
      return b.averageRating - a.averageRating;
    } else if (sortBy === "certified") {
      if (a.isKisteKlarCertified && !b.isKisteKlarCertified) return -1;
      if (!a.isKisteKlarCertified && b.isKisteKlarCertified) return 1;
      return b.averageRating - a.averageRating;
    }
    return 0;
  });

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleConfirmSelection = () => {
    try {
      sessionStorage.setItem(
        "selectedCompany",
        JSON.stringify(selectedCompany)
      );
      router.push("/order/create");
    } catch (error) {
      setError(`Failed to save selection: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div>
        <div></div>
        <h2>Loading moving companies...</h2>
        <p>Please wait a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>
          <div>⚠️</div>
          <h2>An error occurred</h2>
          <p>{error}</p>
          <button onClick={() => router.push("/")}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
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
          <h2>{companies.length} moving companies found</h2>
          <p>
            For {formData?.estimatedHours || 0} hours with{" "}
            {formData?.helpersCount || 0} helpers
          </p>
        </div>

        <div>
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="rating">Best Rating</option>
            <option value="certified">KisteKlar Certified</option>
          </select>
        </div>
      </div>

      {/* Companies List */}
      <div>
        {sortedCompanies.length > 0 ? (
          sortedCompanies.map((company) => (
            <div key={company._id}>
              <div>
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
                  </div>

                  <div>
                    <h3>{company.companyName}</h3>
                    <div>
                      <div>
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(company.averageRating)
                                ? null
                                : null
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span>
                        ({company.reviewsCount}{" "}
                        {company.reviewsCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  </div>
                </div>

                {company.isKisteKlarCertified && (
                  <div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    KisteKlar Certified
                  </div>
                )}
              </div>

              {/* Always visible company details section */}
              <div>
                {company.description && (
                  <div>
                    <h4>Description</h4>
                    <p>{company.description}</p>
                  </div>
                )}

                {company.serviceAreas && company.serviceAreas.length > 0 && (
                  <div>
                    <h4>Service Areas</h4>
                    <div>
                      {company.serviceAreas.map((area, areaIndex) => (
                        <span key={areaIndex}>
                          {area.from} → {area.to}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Single action button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleSelectCompany(company)}
                >
                  Select
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
            <button onClick={() => router.push("/")}>Start New Search</button>
          </div>
        )}
      </div>

      <div>
        <button onClick={() => router.push("/")}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.70711 14.7071C7.31658 15.0976 6.68342 15.0976 6.29289 14.7071L2.29289 10.7071C1.90237 10.3166 1.90237 9.68342 2.29289 9.29289L6.29289 5.29289C6.68342 4.90237 7.31658 4.90237 7.70711 5.29289C8.09763 5.68342 8.09763 6.31658 7.70711 6.70711L5.41421 9H17C17.5523 9 18 9.44772 18 10C18 10.5523 17.5523 11 17 11H5.41421L7.70711 13.2929C8.09763 13.6834 8.09763 14.3166 7.70711 14.7071Z"
              fill="currentColor"
            />
          </svg>
          Back to Home
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedCompany && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
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
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          KisteKlar certified
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <span>Estimated Price:</span>
                  <span>
                    {formData
                      ? 50 *
                        formData.helpersCount *
                        formData.estimatedHours
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
              <button type="button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirmSelection}>
                Select and Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
