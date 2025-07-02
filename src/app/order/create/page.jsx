"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";
import Link from "next/link";
import { useSocket } from "@/context/useSocket";

export default function CreateOrder() {
  const router = useRouter();
  const { notifyOrderCreated } = useSocket();
  const { account, initialCheckDone } = useAuth();
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
    if (!initialCheckDone) return;
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
          preferredDates: parsedFormData.preferredDates?.length
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
  }, [account, router, initialCheckDone]);

  const AddressInputs = ({ type, address, onChange }) => (
    <>
      <p className="section-header">{type === "from" ? "From:" : "To:"}</p>
      <div className="form-field">
        <label>
          Address
          <input
            type="text"
            value={address.street || ""}
            onChange={(e) => onChange({ ...address, street: e.target.value })}
            placeholder="Example Street 123"
          />
        </label>
      </div>
      <div className="form-field">
        <label>
          Postal Code
          <input
            type="text"
            value={address.postalCode || ""}
            onChange={(e) =>
              onChange({ ...address, postalCode: e.target.value })
            }
            placeholder="12345"
          />
        </label>
        <label>
          City
          <input
            type="text"
            value={address.city || ""}
            onChange={(e) => onChange({ ...address, city: e.target.value })}
            placeholder="Berlin"
          />
        </label>
      </div>
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
      
        submitLoading.startLoading();
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
            // 🔔 Benachrichtigung an Firma senden
            notifyOrderCreated(data.order._id, selectedCompany._id);
      
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
          submitLoading.stopLoading();
        }
      };
      
  console.log("initialCheckDone:", initialCheckDone);
  console.log("account:", account);
  console.log("selectedCompany:", selectedCompany);
  return (
    <div className="container">
      <h1>Create Order</h1>
      {error && <p className="error">{error}</p>}

      <p>
        {selectedCompany?.companyName} •{" "}
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < Math.round(selectedCompany?.averageRating || 0) ? "★" : "☆"}
          </span>
        ))}{" "}
        ({selectedCompany?.reviewsCount || 0}{" "}
        {selectedCompany?.reviewsCount === 1 ? "review" : "reviews"})
        {selectedCompany?.isKisteKlarCertified && " • KisteKlar Certified"}
      </p>

      <form onSubmit={handleSubmit}>
        <AddressInputs
          type="from"
          address={formData.fromAddress}
          onChange={(addr) =>
            setFormData((prev) => ({ ...prev, fromAddress: addr }))
          }
        />

        <AddressInputs
          type="to"
          address={formData.toAddress}
          onChange={(addr) =>
            setFormData((prev) => ({ ...prev, toAddress: addr }))
          }
        />

        <p className="section-header">Date Suggestion:</p>
        <div className="form-field">
          {[0, 1, 2].map((index) => (
            <label key={index}>
              {index === 0 ? "Date 1*" : `Date ${index + 1}`}
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
            </label>
          ))}
        </div>

        <p className="section-header">Additional Notes</p>
        <div className="form-field">
          <textarea
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Add any special instructions or information for the moving company..."
            rows={8}
          />
        </div>

        <div className="form-field">
          <label>
            Number of Helpers
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
          </label>
          <label>
            Estimated Hours
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
          </label>
        </div>

        <p>
          Hourly Rate per Helper: 50 €. Total Estimated Price: {totalPrice} €
        </p>

        <div className="form-actions">
          <Link href="/search-results" className="btn-primary">
            Back to Results
          </Link>
          <button
            type="submit"
            disabled={submitLoading.isLoading}
            className="btn-primary"
          >
            {submitLoading.isLoading ? "Submitting..." : "Confirm and Book Now"}
          </button>
        </div>
      </form>
    </div>
  );
}
