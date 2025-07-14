"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { useAuth } from "@/context/AuthContext";
import "@/app/styles/styles.css";

export default function SearchForm() {
  const [fromLocation, setFromLocation] = useState("Berlin");
  const [toLocation, setToLocation] = useState("Hamburg");
  const router = useRouter();
  const searchLoading = useLoading("api", "searchCompanies");
  const { account, checkLoading } = useAuth(); // get account and checkLoading from AuthContext

  // check if user is authenticated and their role
  const isAuthenticated = !!account;
  const isCustomer = account?.role === "user";
  const isCompany = account?.role === "company";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // check if user is authenticated
    if (!isAuthenticated) {
      alert("Please log in to search for moving companies");
      router.push("/login");
      return;
    }

    // check if user is a customer
    if (!isCustomer) {
      alert("Only customers can search for moving companies");
      return;
    }

    if (!fromLocation.trim() || !toLocation.trim()) {
      alert("Please enter both locations");
      return;
    }

    searchLoading.startLoading();

    try {
      const formData = {
        fromAddress: {
          city: fromLocation.trim(),
          postalCode: "10117",
          street: "Friedrichstrasse 123",
        },
        toAddress: {
          city: toLocation.trim(),
          postalCode: "20095",
          street: "Hauptstrasse 456",
        },
        moveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 4,
        helpersCount: 2,
        additionalServices: [],
      };

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

      sessionStorage.setItem("movingFormData", JSON.stringify(formData));
      sessionStorage.setItem("searchResults", JSON.stringify(companies));

      router.push("/search-results");
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
    } finally {
      searchLoading.stopLoading();
    }
  };

  const handleLoginPrompt = () => {
    if (!isAuthenticated) {
      alert("Please log in to search for moving companies");
      router.push("/login");
    } else if (!isCustomer) {
      alert("Only customers can search for moving companies");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="search-inputs">
          <div className="input-field">
            <label htmlFor="fromLocation" className="no-wrap">
              Moving from
            </label>
            <input
              type="text"
              id="fromLocation"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="Berlin"
              required
              disabled={searchLoading.isLoading || checkLoading}
            />
          </div>

          <div className="input-field">
            <label htmlFor="toLocation" className="no-wrap">
              Moving to
            </label>
            <input
              type="text"
              id="toLocation"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="Hamburg"
              required
              disabled={searchLoading.isLoading || checkLoading}
            />
          </div>
        </div>

        {!isAuthenticated && (
          <div
            className="auth-notice"
            style={{
              padding: "10px",
              marginBottom: "15px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
              color: "#856404",
            }}
          >
            Please log in to search for moving companies
          </div>
        )}

        {isAuthenticated && isCompany && (
          <div
            className="auth-notice"
            style={{
              padding: "10px",
              marginBottom: "15px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              color: "#721c24",
            }}
          >
            Only customers can search for moving companies
          </div>
        )}

        <button
          type={isAuthenticated && isCustomer ? "submit" : "button"}
          onClick={
            isAuthenticated && isCustomer ? undefined : handleLoginPrompt
          }
          disabled={
            searchLoading.isLoading ||
            !isAuthenticated ||
            !isCustomer ||
            checkLoading
          }
          className={`btn-primary ${!isAuthenticated || !isCustomer ? "btn-disabled" : ""}`}
          style={{
            opacity: !isAuthenticated || !isCustomer ? 0.6 : 1,
            cursor: !isAuthenticated || !isCustomer ? "not-allowed" : "pointer",
          }}
        >
          {checkLoading
            ? "Checking authentication..."
            : searchLoading.isLoading
              ? "Searching..."
              : !isAuthenticated
                ? "Login to Find Companies"
                : !isCustomer
                  ? "Only Customers Can Find Companies"
                  : "Find companies"}
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
