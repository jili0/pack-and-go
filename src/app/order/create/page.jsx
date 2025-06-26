"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function CreateOrder() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    fromAddress: {},
    toAddress: {},
    helpersCount: 2,
    estimatedHours: 4,
    preferredDates: ["", "", ""],
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!account) {
      router.push("/login?redirect=order/create");
      return;
    }

    const savedCompany = sessionStorage.getItem("selectedCompany");
    const savedFormData = sessionStorage.getItem("movingFormData");

    if (!savedCompany || !savedFormData) {
      router.push("/");
      return;
    }

    try {
      const parsedCompany = JSON.parse(savedCompany);
      const parsedFormData = JSON.parse(savedFormData);

      setSelectedCompany(parsedCompany);
      setFormData({
        ...parsedFormData,
        helpersCount: parsedFormData.helpersCount || 2,
        estimatedHours: parsedFormData.estimatedHours || 4,
        preferredDates: parsedFormData.preferredDates?.length
          ? [...parsedFormData.preferredDates, "", "", ""].slice(0, 3)
          : ["", "", ""],
        notes: parsedFormData.notes || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading order data:", error);
      setError("Failed to load order data. Please try again.");
      setLoading(false);
    }
  }, [account, router, authLoading]);

  const AddressInputs = ({ type, address, onChange }) => (
    <>
      <p>{type === "from" ? "Origin" : "Destination"}</p>
      <label>Street and Number</label>
      <input
        type="text"
        value={address.street || ""}
        onChange={(e) => onChange({ ...address, street: e.target.value })}
        placeholder="Example Street 123"
      />
      <label>Postal Code</label>
      <input
        type="text"
        value={address.postalCode || ""}
        onChange={(e) => onChange({ ...address, postalCode: e.target.value })}
        placeholder="12345"
      />
      <label>City</label>
      <input
        type="text"
        value={address.city || ""}
        onChange={(e) => onChange({ ...address, city: e.target.value })}
        placeholder="Berlin"
      />
    </>
  );

  const validateForm = () => {
    const { fromAddress, toAddress, preferredDates } = formData;

    if (
      !fromAddress?.street ||
      !fromAddress?.city ||
      !fromAddress?.postalCode
    ) {
      setError("Please complete the origin address.");
      return false;
    }
    if (!toAddress?.street || !toAddress?.city || !toAddress?.postalCode) {
      setError("Please complete the destination address.");
      return false;
    }
    if (!preferredDates?.[0]) {
      setError("Please select at least one preferred date.");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const date of preferredDates) {
      if (date && new Date(date) < today) {
        setError("Selected dates must be in the future.");
        return false;
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
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      const hourlyRate = selectedCompany.hourlyRate || 50;
      const calculatedPrice =
        hourlyRate * formData.helpersCount * formData.estimatedHours;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany._id,
          fromAddress: formData.fromAddress,
          toAddress: formData.toAddress,
          preferredDates: formData.preferredDates.filter((date) => date),
          helpersCount: formData.helpersCount,
          estimatedHours: formData.estimatedHours,
          totalPrice: calculatedPrice,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        ["selectedCompany", "movingFormData", "searchResults"].forEach((item) =>
          sessionStorage.removeItem(item)
        );
        router.push(`/order/${data.order._id}/confirmation`);
      } else {
        setError(data.message || "Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <p>Authenticating...</p>;
  if (loading) return <p>Loading order details...</p>;
  if (!selectedCompany) return <p>No company selected. Redirecting...</p>;

  return (
    <div className="container">
      <h1>Create Order</h1>
      {error && <p className="error">{error}</p>}

      <div className="company-info">
        <p>{selectedCompany.companyName}</p>
        <div className="company-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i}>
              {i < Math.round(selectedCompany.averageRating || 0) ? "★" : "☆"}
            </span>
          ))}
          <span>
            ({selectedCompany.reviewsCount || 0}{" "}
            {selectedCompany.reviewsCount === 1 ? "review" : "reviews"})
          </span>
        </div>
        {selectedCompany.isKisteKlarCertified && (
          <div className="certified-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
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

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-field">
            <AddressInputs
              type="from"
              address={formData.fromAddress}
              onChange={(addr) =>
                setFormData((prev) => ({ ...prev, fromAddress: addr }))
              }
            />
          </div>
          <div className="input-field">
            <AddressInputs
              type="to"
              address={formData.toAddress}
              onChange={(addr) =>
                setFormData((prev) => ({ ...prev, toAddress: addr }))
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-field">
            <p>Preferred Dates</p>
            <p>
              Please select up to three preferred dates for your move. The
              company will confirm one of these dates.
            </p>
            {[0, 1, 2].map((index) => (
              <div key={index} className="form-field">
                <label>
                  {index === 0 ? "Primary Date*" : `Alternative ${index}`}
                </label>
                <input
                  type="date"
                  value={formData.preferredDates?.[index] || ""}
                  onChange={(e) => {
                    const newDates = [
                      ...(formData.preferredDates || ["", "", ""]),
                    ];
                    newDates[index] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      preferredDates: newDates,
                    }));
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  required={index === 0}
                />
              </div>
            ))}
          </div>
          <div className="input-field">
            <div className="form-field">
              <label>Additional Notes</label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any special instructions or information for the moving company..."
                rows={8}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="input-field">
            <div className="form-field">
              <label>Number of Helpers</label>
              <input
                value={formData.helpersCount || 2}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    helpersCount: Number(e.target.value),
                  }))
                }
                type="number"
                min="1"
                max="100"
                required
              />
            </div>
            <div className="form-field">
              <label>Estimated Hours</label>
              <input
                value={formData.estimatedHours || 4}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedHours: Number(e.target.value),
                  }))
                }
                type="number"
                min="1"
                max="100"
                required
              />
            </div>
          </div>
          <div className="input-field pricing-info">
            <p>Hourly Rate per Helper: 50 €</p>
            <p>Total Estimated Price: {totalPrice} €</p>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/search-results" className="btn-primary">
            Back to Results
          </Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Submitting..." : "Confirm and Book Now"}
          </button>
        </div>
      </form>
    </div>
  );
}
