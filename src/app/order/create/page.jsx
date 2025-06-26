"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";
import Link from "next/link";
import Image from "@/components/ui/Image";
import AddressForm from "@/components/forms/AddressForm";

export default function CreateOrder() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();
  const sessionLoading = useLoading("api", "sessionData");
  const submitLoading = useLoading("api", "createOrder");

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    fromAddress: {},
    toAddress: {},
    helpersCount: 2,
    estimatedHours: 4,
    preferredDates: ["", "", ""],
    notes: "",
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!account) {
      router.push("/login?redirect=order/create");
      return;
    }

    const loadSessionData = async () => {
      sessionLoading.startLoading();
      try {
        const savedCompany = sessionStorage.getItem("selectedCompany");
        const savedFormData = sessionStorage.getItem("movingFormData");

        if (!savedCompany || !savedFormData) {
          router.push("/");
          return;
        }

        const parsedCompany = JSON.parse(savedCompany);
        const parsedFormData = JSON.parse(savedFormData);

        setSelectedCompany(parsedCompany);
        setFormData({
          ...parsedFormData,
          helpersCount: parsedFormData.helpersCount || 2,
          estimatedHours: parsedFormData.estimatedHours || 4,
          preferredDates:
            parsedFormData.preferredDates &&
            Array.isArray(parsedFormData.preferredDates)
              ? [...parsedFormData.preferredDates, "", "", ""].slice(0, 3)
              : ["", "", ""],
          notes: parsedFormData.notes || "",
        });
      } catch (error) {
        console.error("Error loading order data:", error);
        setError("Failed to load order data. Please try again.");
      } finally {
        sessionLoading.stopLoading();
      }
    };

    loadSessionData();
  }, [account, router, authLoading]);

  const handleFromAddressChange = (address) => {
    setFormData((prev) => ({ ...prev, fromAddress: address }));
  };

  const handleToAddressChange = (address) => {
    setFormData((prev) => ({ ...prev, toAddress: address }));
  };

  const handleDateChange = (index, e) => {
    setFormData((prev) => {
      const newDates = [...(prev.preferredDates || ["", "", ""])];
      newDates[index] = e.target.value;
      return { ...prev, preferredDates: newDates };
    });
  };

  const handleHelpersChange = (e) => {
    setFormData((prev) => ({ ...prev, helpersCount: Number(e.target.value) }));
  };

  const handleHoursChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      estimatedHours: Number(e.target.value),
    }));
  };

  const handleNotesChange = (e) => {
    setFormData((prev) => ({ ...prev, notes: e.target.value }));
  };

  const validateForm = () => {
    if (
      !formData.fromAddress?.street ||
      !formData.fromAddress?.city ||
      !formData.fromAddress?.postalCode
    ) {
      setError("Please complete the origin address.");
      return false;
    }

    if (
      !formData.toAddress?.street ||
      !formData.toAddress?.city ||
      !formData.toAddress?.postalCode
    ) {
      setError("Please complete the destination address.");
      return false;
    }

    if (!formData.preferredDates?.[0]) {
      setError("Please select at least one preferred date.");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const date of formData.preferredDates || []) {
      if (date) {
        const selectedDate = new Date(date);
        if (selectedDate < today) {
          setError("Selected dates must be in the future.");
          return false;
        }
      }
    }

    return true;
  };

  const totalPrice =
    selectedCompany && formData.helpersCount && formData.estimatedHours
      ? (selectedCompany.hourlyRate || 50) *
        formData.helpersCount *
        formData.estimatedHours
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    submitLoading.startLoading();
    setError(null);

    try {
      const hourlyRate = selectedCompany.hourlyRate || 50;
      const calculatedPrice =
        hourlyRate * formData.helpersCount * formData.estimatedHours;

      const orderData = {
        companyId: selectedCompany._id,
        fromAddress: formData.fromAddress,
        toAddress: formData.toAddress,
        preferredDates: (formData.preferredDates || []).filter((date) => date),
        helpersCount: formData.helpersCount,
        estimatedHours: formData.estimatedHours,
        totalPrice: calculatedPrice,
        notes: formData.notes,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.removeItem("selectedCompany");
        sessionStorage.removeItem("movingFormData");
        sessionStorage.removeItem("searchResults");

        router.push(`/order/${data.order._id}/confirmation`);
      } else {
        setError(data.message || "Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      submitLoading.stopLoading();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (authLoading || sessionLoading.isLoading) {
    return (
      <div className="loading-container">
        <Loader
          text={authLoading ? "Authenticating..." : "Loading order details..."}
        />
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="loading-container">
        <p>No company selected. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="create-order-page">
      <div className="container">
        <div className="page-header">
          <h1>Create Order</h1>
          <p>Review your details and confirm your booking</p>
        </div>

        {error && (
          <div className="error-alert">
            <div className="error-icon">!</div>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header">
              <h2>Selected Moving Company</h2>
            </div>
            <div className="card-body">
              <div className="company-info">
                <div className="company-details">
                  <h3>{selectedCompany.companyName}</h3>
                  <div className="rating-container">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.round(selectedCompany.averageRating || 0)
                              ? "star-filled"
                              : "star-empty"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="review-count">
                      ({selectedCompany.reviewsCount || 0}{" "}
                      {selectedCompany.reviewsCount === 1
                        ? "review"
                        : "reviews"}
                      )
                    </span>
                  </div>
                  {selectedCompany.isKisteKlarCertified && (
                    <div className="certified-badge">
                      <svg
                        className="certified-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      KisteKlar Certified
                    </div>
                  )}
                </div>
              </div>

              {selectedCompany.description && (
                <div className="company-description">
                  <h4>About the Company</h4>
                  <p>{selectedCompany.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Moving Addresses</h2>
            </div>
            <div className="card-body">
              <div className="addresses-container">
                <div className="address-form">
                  <h3>Origin</h3>
                  <AddressForm
                    initialValues={formData.fromAddress}
                    onChange={handleFromAddressChange}
                  />
                </div>
                <div className="address-arrow">→</div>
                <div className="address-form">
                  <h3>Destination</h3>
                  <AddressForm
                    initialValues={formData.toAddress}
                    onChange={handleToAddressChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Moving Details</h2>
            </div>
            <div className="card-body">
              <div className="details-grid">
                <div className="detail-group">
                  <label className="detail-label">Number of Helpers</label>
                  <input
                    name="helpersCount"
                    id="helpersCount"
                    autoComplete="off"
                    value={formData.helpersCount || 2}
                    onChange={handleHelpersChange}
                    placeholder="Add any number of helpers needed..."
                    type="number"
                    min="1"
                    max="100"
                    required
                    className="helpers-input"
                  />
                </div>

                <div className="detail-group">
                  <label className="detail-label">Estimated Hours</label>
                  <input
                    name="helpersCount"
                    id="helpersCount"
                    autoComplete="off"
                    value={formData.estimatedHours || 4}
                    onChange={handleHoursChange}
                    placeholder="Add any number of hours needed..."
                    type="number"
                    min="1"
                    max="100"
                    required
                    className="estimated-hours-input"
                  />
                </div>
              </div>

              <div className="date-picker">
                <h3>Preferred Dates</h3>
                <p className="date-info">
                  Please select up to three preferred dates for your move. The
                  company will confirm one of these dates.
                </p>

                <div className="date-inputs">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="date-input-group">
                      <label className="date-label">
                        {index === 0 ? (
                          <span className="primary-date">Primary Date*</span>
                        ) : (
                          `Alternative ${index}`
                        )}
                      </label>
                      <input
                        type="date"
                        value={
                          (formData.preferredDates &&
                            formData.preferredDates[index]) ||
                          ""
                        }
                        onChange={(e) => handleDateChange(index, e)}
                        min={new Date().toISOString().split("T")[0]}
                        required={index === 0}
                        className="date-input"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="notes-section">
                <h3>Additional Notes</h3>
                <textarea
                  value={formData.notes || ""}
                  onChange={handleNotesChange}
                  placeholder="Add any special instructions or information for the moving company..."
                  className="notes-input"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Price Summary</h2>
            </div>
            <div className="card-body">
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Hourly Rate per Helper</span>
                  <span>50 €</span>
                </div>
                <div className="price-row">
                  <span>Number of Helpers</span>
                  <span>{formData.helpersCount}</span>
                </div>
                <div className="price-row">
                  <span>Estimated Hours</span>
                  <span>{formData.estimatedHours}</span>
                </div>
                <div className="price-divider"></div>
                <div className="price-total-row">
                  <span>Total Price</span>
                  <span className="total-price">{totalPrice} €</span>
                </div>
              </div>

              <p className="price-note">
                Note: The final price may vary based on the actual duration of
                the move.
              </p>
            </div>
          </div>

          <div className="action-buttons">
            <Link href="/search-results" className="back-button">
              Back to Results
            </Link>
            <button
              type="submit"
              className="submit-button"
              disabled={submitLoading.isLoading}
            >
              {submitLoading.isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  Submitting...
                </>
              ) : (
                "Confirm and Book Now"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
