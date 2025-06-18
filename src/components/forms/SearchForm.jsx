"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/styles/styles.css";

export default function SearchForm() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fromLocation.trim() || !toLocation.trim()) {
      alert("Please enter both locations");
      return;
    }

    setLoading(true);

    try {
      // Create form data with default values
      const formData = {
        fromAddress: {
          city: fromLocation.trim(),
          postalCode: "00000", // Default postal code
          street: "Address not specified",
        },
        toAddress: {
          city: toLocation.trim(),
          postalCode: "00000", // Default postal code
          street: "Address not specified",
        },
        moveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        estimatedHours: 4, // Default 4 hours
        helpersCount: 2, // Default 2 helpers
        additionalServices: [], // Empty by default
      };

      // Search for companies based on locations
      const response = await fetch("/api/search-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromCity: fromLocation.trim(),
          toCity: toLocation.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const companies = await response.json();

      // Save to session storage
      sessionStorage.setItem("movingFormData", JSON.stringify(formData));
      sessionStorage.setItem("searchResults", JSON.stringify(companies));

      // Navigate to search results
      router.push("/search-results");
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="search-inputs">
          <div className="input-field">
            <label htmlFor="fromLocation">Moving from</label>
            <input
              type="text"
              id="fromLocation"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="Your current city"
              required
              disabled={loading}
            />
          </div>

          <div className="arrow-icon">
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
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>

          <div className="input-field">
            <label htmlFor="toLocation">Moving to</label>
            <input
              type="text"
              id="toLocation"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="Your destination city"
              required
              disabled={loading}
            />
          </div>
        </div>
<button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Searching..." : "Find companies"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
