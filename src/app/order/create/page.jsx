"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Link from "next/link";
import { useSocket } from "@/context/useSocket";

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
          placeholder={
            type === "from" ? "Friedrichstrasse 123" : "Hauptstrasse 456"
          }
        />
      </label>
    </div>
    <div className="form-field">
      <label>
        Postal Code
        <input
          type="text"
          value={address.postalCode || ""}
          onChange={(e) => onChange({ ...address, postalCode: e.target.value })}
          placeholder={type === "from" ? "10117" : "20095"}
        />
      </label>
      <label>
        City
        <input
          type="text"
          value={address.city || ""}
          onChange={(e) => onChange({ ...address, city: e.target.value })}
          placeholder={type === "from" ? "Berlin" : "Hamburg"}
        />
      </label>
    </div>
  </>
);

const getDefaultDates = () => {
  const dates = [];
  for (let i = 1; i <= 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

export default function CreateOrder() {
  const router = useRouter();
  const { emitOrderCreated, isConnected } = useSocket();
  const { account, initialCheckDone } = useAuth();
  const sessionLoading = useLoading("api", "sessionData");
  const submitLoading = useLoading("api", "createOrder");

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    fromAddress: {
      street: "Friedrichstrasse 123",
      city: "Berlin",
      postalCode: "10117",
    },
    toAddress: {
      street: "Hauptstrasse 456",
      city: "Hamburg",
      postalCode: "20095",
    },
    helpersCount: 2,
    estimatedHours: 4,
    preferredDates: getDefaultDates(),
    notes: "Please handle fragile items with extra care.",
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
        console.log("📦 selectedCompany:", parsedCompany);

        setFormData({
          fromAddress: parsedFormData.fromAddress || {
            street: "Friedrichstrasse 123",
            city: "Berlin",
            postalCode: "10117",
          },
          toAddress: parsedFormData.toAddress || {
            street: "Hauptstrasse 456",
            city: "Hamburg",
            postalCode: "20095",
          },
          helpersCount: parsedFormData.helpersCount || 2,
          estimatedHours: parsedFormData.estimatedHours || 4,
          preferredDates: parsedFormData.preferredDates?.length
            ? [...parsedFormData.preferredDates, "", "", ""].slice(0, 3)
            : getDefaultDates(),
          notes:
            parsedFormData.notes ||
            "Please handle fragile items with extra care.",
        });
      } catch (error) {
        console.error("Error loading order data:", error);
        setError("Failed to load order data. Please try again.");
      } finally {
        sessionLoading.stopLoading();
      }
    };

    loadSessionData();
  }, [initialCheckDone, account?.id]);

  useEffect(() => {
    if (isConnected) {
      console.log("✅ Socket is connected and ready for notifications");
    } else {
      console.warn("⚠️ Socket is not connected - notifications may not work");
    }
  }, [isConnected]);

  const totalPrice =
    selectedCompany && formData.helpersCount && formData.estimatedHours
      ? (selectedCompany.hourlyRate || 50) *
        formData.helpersCount *
        formData.estimatedHours
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = { ...formData };

    if (!submissionData.fromAddress.street?.trim()) {
      submissionData.fromAddress.street = "Friedrichstrasse 123";
    }
    if (!submissionData.fromAddress.city?.trim()) {
      submissionData.fromAddress.city = "Berlin";
    }
    if (!submissionData.fromAddress.postalCode?.trim()) {
      submissionData.fromAddress.postalCode = "10117";
    }

    if (!submissionData.toAddress.street?.trim()) {
      submissionData.toAddress.street = "Hauptstrasse 456";
    }
    if (!submissionData.toAddress.city?.trim()) {
      submissionData.toAddress.city = "Hamburg";
    }
    if (!submissionData.toAddress.postalCode?.trim()) {
      submissionData.toAddress.postalCode = "20095";
    }

    if (
      !submissionData.preferredDates ||
      submissionData.preferredDates.filter((date) => date).length === 0
    ) {
      submissionData.preferredDates = getDefaultDates();
    }

    if (!submissionData.notes?.trim()) {
      submissionData.notes = "Please handle fragile items with extra care.";
    }

    submitLoading.startLoading();
    setError(null);

    try {
      const hourlyRate = selectedCompany.hourlyRate || 50;
      const calculatedPrice =
        hourlyRate *
        submissionData.helpersCount *
        submissionData.estimatedHours;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany?._id,
          fromAddress: submissionData.fromAddress,
          toAddress: submissionData.toAddress,
          preferredDates: submissionData.preferredDates.filter((date) => date),
          helpersCount: submissionData.helpersCount,
          estimatedHours: submissionData.estimatedHours,
          totalPrice: calculatedPrice,
          notes: submissionData.notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (isConnected) {
          try {
            emitOrderCreated(data.order._id, selectedCompany.accountId);
            console.log("✅ Socket notification sent successfully");
          } catch (socketError) {
            console.error(
              "❌ Failed to send socket notification:",
              socketError
            );
          }
        } else {
          console.warn("⚠️ Socket not connected, notification not sent");
          await sendNotificationFallback(data.order._id, selectedCompany._id);
        }

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

  const sendNotificationFallback = async (orderId, companyId) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "orderCreated",
          orderId,
          companyId,
        }),
      });
      console.log("✅ Fallback notification sent");
    } catch (error) {
      console.error("❌ Fallback notification failed:", error);
    }
  };

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
                    ...(formData.preferredDates || getDefaultDates()),
                  ];
                  newDates[index] = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    preferredDates: newDates,
                  }));
                }}
                min={new Date().toISOString().split("T")[0]}
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
            placeholder="Please handle fragile items with extra care."
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
