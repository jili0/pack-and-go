"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/styles/styles.css";

export default function SearchForm() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD

=======
    setError("");
    
>>>>>>> 0eb7fadcdeb49b3106164f1395ae53ab1ee35b84
    if (!fromLocation.trim() || !toLocation.trim()) {
      setError("Please enter both departure and destination locations");
      return;
    }

    setLoading(true);

    try {
      // Create form data (with default values)
      const formData = {
        fromAddress: {
          city: fromLocation.trim(),
<<<<<<< HEAD
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
=======
          postalCode: "00000",
          street: "Address not specified"
        },
        toAddress: {
          city: toLocation.trim(),
          postalCode: "00000",
          street: "Address not specified"
        },
        moveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 4,
        helpersCount: 2,
        additionalServices: []
      };

      console.log('Search parameters:', {
        fromCity: fromLocation.trim(),
        toCity: toLocation.trim()
      });

      // Call search API
      const response = await fetch('/api/search-companies', {
        method: 'POST',
>>>>>>> 0eb7fadcdeb49b3106164f1395ae53ab1ee35b84
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromCity: fromLocation.trim(),
          toCity: toLocation.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('Search results:', result);

<<<<<<< HEAD
      // Save to session storage
      sessionStorage.setItem("movingFormData", JSON.stringify(formData));
      sessionStorage.setItem("searchResults", JSON.stringify(companies));

      // Navigate to search results
      router.push("/search-results");
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
=======
      // Check response format
      let companies = [];
      let searchSummary = null;

      if (result.success !== undefined) {
        // New response format
        if (!result.success) {
          throw new Error(result.message || 'Search failed');
        }
        companies = result.companies || [];
        searchSummary = result.searchSummary;
      } else if (Array.isArray(result)) {
        // Old response format (direct array of companies)
        companies = result;
      } else {
        throw new Error('Invalid response format');
      }

      // Save search data to sessionStorage
      sessionStorage.setItem('movingFormData', JSON.stringify(formData));
      sessionStorage.setItem('searchResults', JSON.stringify(companies));
      
      if (searchSummary) {
        sessionStorage.setItem('searchSummary', JSON.stringify(searchSummary));
      }

      console.log(`Found ${companies.length} moving companies`);

      // Navigate to search results page
      router.push('/search-results');

    } catch (error) {
      console.error('Search failed:', error);
      setError(error.message || 'Search failed, please try again later');
>>>>>>> 0eb7fadcdeb49b3106164f1395ae53ab1ee35b84
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    // Clear error message when user starts typing
    if (error) {
      setError("");
    }
  };

  return (
<<<<<<< HEAD
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="search-inputs">
          <div className="input-field">
            <label htmlFor="fromLocation">Moving from</label>
=======
    <div className={styles.searchFormWrapper}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        {error && (
          <div className={styles.errorMessage}>
            <svg 
              className={styles.errorIcon} 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </div>
        )}
        
        <div className={styles.inputGroup}>
          <div className={styles.inputWrapper}>
            <label htmlFor="fromLocation" className={styles.inputLabel}>
              Moving From
            </label>
>>>>>>> 0eb7fadcdeb49b3106164f1395ae53ab1ee35b84
            <input
              type="text"
              id="fromLocation"
              value={fromLocation}
<<<<<<< HEAD
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="Your current city"
=======
              onChange={handleInputChange(setFromLocation)}
              placeholder="Enter your current city"
              className={`${styles.searchInput} ${error ? styles.inputError : ''}`}
>>>>>>> 0eb7fadcdeb49b3106164f1395ae53ab1ee35b84
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
<<<<<<< HEAD

          <div className="input-field">
            <label htmlFor="toLocation">Moving to</label>
=======
          
          <div className={styles.inputWrapper}>
            <label htmlFor="toLocation" className={styles.inputLabel}>
              Moving To
            </label>
>>>>>>> 0eb7fadcdeb49b3106164f1395ae53ab1ee35b84
            <input
              type="text"
              id="toLocation"
              value={toLocation}
<<<<<<< HEAD
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="Your destination city"
=======
              onChange={handleInputChange(setToLocation)}
              placeholder="Enter destination city"
              className={`${styles.searchInput} ${error ? styles.inputError : ''}`}
>>>>>>> 0eb7fadcdeb49b3106164f1395ae53ab1ee35b84
              required
              disabled={loading}
            />
          </div>
        </div>
<<<<<<< HEAD

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
=======
        
        <button 
          type="submit" 
          className={`${styles.submitButton} ${loading ? styles.loading : ''}`} 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className={styles.spinner}></div>
              Searching...
            </>
          ) : (
            <>
              Find Moving Companies
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={styles.submitIcon}
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
>>>>>>> 0eb7fadcdeb49b3106164f1395ae53ab1ee35b84
        </button>
      </form>
      
      {/* Search tips */}
      <div className={styles.searchHints}>
        <p className={styles.hintText}>
          💡 Tip: Enter city names only, e.g. "Berlin", "Frankfurt", "Munich"
        </p>
        <p className={styles.hintText}>
          🚚 Supports both local and long-distance moving services
        </p>
      </div>
    </div>
  );
}
