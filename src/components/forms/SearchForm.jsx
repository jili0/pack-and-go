"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/styles/styles.css";
// import styles from "@/app/styles/SearchForm.module.css";

export default function SearchForm() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCity: fromLocation.trim(),
          toCity: toLocation.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('Search results:', result);

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
    <div className="search-form-wrapper">
      <form onSubmit={handleSubmit} className="search-form">
        {error && (
          <div className="error-message">
            <svg 
              className="error-icon" 
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
        
        <div className="input-group">
          <div className="input-wrapper">
            <label htmlFor="fromLocation" className="input-label">
              Moving From
            </label>
            <input
              type="text"
              id="fromLocation"
              value={fromLocation}
              onChange={handleInputChange(setFromLocation)}
              placeholder="Enter your current city"
              className={`search-input ${error ? 'input-error' : ''}`}
              required
              disabled={loading}
            />
          </div>
          
          <div className="arrow-wrapper">
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
              className="arrow-icon"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
          
          <div className="input-wrapper">
            <label htmlFor="toLocation" className="input-label">
              Moving To
            </label>
            <input
              type="text"
              id="toLocation"
              value={toLocation}
              onChange={handleInputChange(setToLocation)}
              placeholder="Enter destination city"
              className={`search-input ${error ? 'input-error' : ''}`}
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`submit-button ${loading ? 'loading' : ''}`} 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
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
                className="submit-icon"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </button>
      </form>
      
      {/* Search tips */}
      <div className="search-hints">
        <p className="hint-text">
          💡 Tip: Enter city names only, e.g. "Berlin", "Frankfurt", "Munich"
        </p>
        <p className="hint-text">
          🚚 Supports both local and long-distance moving services
        </p>
      </div>
    </div>
  );
}