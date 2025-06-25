"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchResults() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("rating");

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
        const parsedResults = JSON.parse(savedResults);
        const companiesArray = parsedResults.companies || parsedResults;
        setCompanies(Array.isArray(companiesArray) ? companiesArray : []);
      } catch (error) {
        setError(`Search results could not be loaded: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  const filteredAndSortedCompanies = (companies || [])
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
    .filter((company) => {
      if (sortBy === "certified") {
        return company.isKisteKlarCertified === true;
      }
      return true;
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

  const selectCompany = (company) => {
    try {
      sessionStorage.setItem("selectedCompany", JSON.stringify(company));
      router.push("/order/create");
    } catch (error) {
      setError(`Action failed: ${error.message}`);
    }
  };

  if (loading) return <p>Loading moving companies...</p>;

  if (error)
    return (
      <div className="container">
        <p className="error">{error}</p>
        <button className="btn-primary" onClick={() => router.push("/")}>
          Back to Home
        </button>
      </div>
    );

  return (
    <div className="container">
      <h1>{filteredAndSortedCompanies.length} moving companies found</h1>
      <p>
        From <b>{formData?.fromAddress?.city || "Start location"}</b> to{" "}
        <b>{formData?.toAddress?.city || "Destination"}</b>, for{" "}
        <b>{formData?.estimatedHours || 0}</b> hours with{" "}
        <b>{formData?.helpersCount || 0}</b> helpers
      </p>

      <div className="form-field">
        <label>
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Best Rating</option>
            <option value="certified">KisteKlar Certified</option>
          </select>
        </label>
      </div>

      {filteredAndSortedCompanies.length > 0 ? (
        filteredAndSortedCompanies.map((company) => (
          <div
            key={company._id}
            className="company-card"
            onClick={() => selectCompany(company)}
          >
            <div className="company-info">
              <strong className="company-name">{company.companyName}</strong>
              <div className="yellow">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
                &nbsp; ({company.reviewsCount}&nbsp;
                {company.reviewsCount === 1 ? "review" : "reviews"})
              </div>
            </div>

            <div className="green">
              {company.isKisteKlarCertified && (
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
                  &nbsp;KisteKlar Certified
                </div>
              )}
            </div>

            <div>
              <strong>Service Areas</strong>
              {company.serviceAreas?.map((area, index) => (
                <div key={index}>
                  {area.from} → {area.to}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div>
          <p>No matching moving companies found.</p>
          <button className="btn-primary" onClick={() => router.push("/")}>
            Start New Search
          </button>
        </div>
      )}
    </div>
  );
}
