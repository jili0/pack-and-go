"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/styles/SearchForm.module.css";

export default function SearchForm() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!fromLocation.trim() || !toLocation.trim()) {
      alert("Please enter both locations");
      return;
    }

    // Create search parameters and navigate to search results page
    const searchParams = new URLSearchParams({
      from: fromLocation.trim(),
      to: toLocation.trim()
    });
    
    // hier muss angepasst werden!
    router.push(`/search-results`);
  };

  return (
    <div className={styles.searchFormWrapper}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.inputGroup}>
          <div className={styles.inputWrapper}>
            <label htmlFor="fromLocation" className={styles.inputLabel}>
              Moving from
            </label>
            <input
              type="text"
              id="fromLocation"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="Enter your current city"
              className={styles.searchInput}
              required
            />
          </div>
          
          <div className={styles.arrowWrapper}>
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
              className={styles.arrowIcon}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
          
          <div className={styles.inputWrapper}>
            <label htmlFor="toLocation" className={styles.inputLabel}>
              Moving to
            </label>
            <input
              type="text"
              id="toLocation"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="Enter your destination city"
              className={styles.searchInput}
              required
            />
          </div>
        </div>
        
        <button type="submit" className={styles.submitButton}>
          Find companies
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
        </button>
      </form>
    </div>
  );
}