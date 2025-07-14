"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";

export default function CompanyProfileEdit() {
  const router = useRouter();
  const { account, initialCheckDone } = useAuth();
  const profileLoading = useLoading("api", "companyProfile");
  const submitLoading = useLoading("api", "submitProfile");

  const [companyName, setCompanyName] = useState("");
  const [formData, setFormData] = useState({
    taxId: "123456789",
    street: "Friedrichstrasse 123",
    city: "Berlin",
    postalCode: "10117",
    country: "Germany",
    phone: "+49 30 12345678",
    email: "info@berlinmoving.de",
    isKisteKlarCertified: false,
    serviceAreas: [{ from: "Berlin", to: "Hamburg" }],
    kisteKlarCertificate: null,
  });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (!initialCheckDone) return;

    if (!account) {
      router.push("/login");
      return;
    }

    if (account.role !== "company") {
      router.push("/");
      return;
    }

    // Set company name and email from account (always available)
    setCompanyName(account.name);
    setFormData((prev) => ({
      ...prev,
      email: account.email,
    }));

    fetchCompanyProfile();
  }, [initialCheckDone, account, router]);

  const fetchCompanyProfile = async () => {
    profileLoading.startLoading();
    try {
      const response = await fetch("/api/company/profile");
      if (!response.ok) {
        if (response.status === 404) {
          return;
        }
        throw new Error("Error loading company profile");
      }
      const result = await response.json();
      if (result.success && result.company) {
        const company = result.company;
        // Update formData with real data, keeping defaults for empty fields
        setFormData((prev) => ({
          taxId: company.taxId || prev.taxId,
          street: company.address?.street || prev.street,
          city: company.address?.city || prev.city,
          postalCode: company.address?.postalCode || prev.postalCode,
          country: company.address?.country || prev.country,
          phone: company.phone || prev.phone,
          email: company.email || prev.email,
          isKisteKlarCertified: company.isKisteKlarCertified || false,
          serviceAreas:
            company.serviceAreas?.length > 0
              ? company.serviceAreas
              : prev.serviceAreas,
          kisteKlarCertificate: null,
        }));
      }
    } catch (error) {
      console.error("Error loading company profile:", error);
      setSubmitMessage("Error loading company profile.");
    } finally {
      profileLoading.stopLoading();
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const updateServiceArea = (index, field, value) => {
    const areas = [...formData.serviceAreas];
    areas[index][field] = value || (field === "from" ? "Berlin" : "Hamburg");
    setFormData((prev) => ({ ...prev, serviceAreas: areas }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Apply default values for empty fields before submitting
    const defaultValues = {
      taxId: "123456789",
      street: "Friedrichstrasse 123",
      city: "Berlin",
      postalCode: "10117",
      country: "Germany",
      phone: "+49 30 12345678",
      email: "info@berlinmoving.de",
    };

    const submissionData = { ...formData };
    Object.keys(defaultValues).forEach((key) => {
      if (!submissionData[key] || submissionData[key].trim() === "") {
        submissionData[key] = defaultValues[key];
      }
    });

    // Remove companyName from submission data since it's not editable
    // companyName is now in separate state and not part of formData

    // Apply default values for service areas
    submissionData.serviceAreas = submissionData.serviceAreas.map((area) => ({
      from: area.from.trim() === "" ? "Berlin" : area.from,
      to: area.to.trim() === "" ? "Hamburg" : area.to,
    }));

    const newErrors = {};

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    submitLoading.startLoading();
    setSubmitMessage("");

    try {
      const data = new FormData();
      Object.entries(submissionData).forEach(([key, value]) => {
        if (key === "serviceAreas") {
          data.append(key, JSON.stringify(value));
        } else if (key === "isKisteKlarCertified") {
          data.append(key, value.toString());
        } else if (key === "kisteKlarCertificate" && value instanceof File) {
          data.append(key, value);
        } else if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      const response = await fetch("/api/company/profile", {
        method: "POST",
        body: data,
      });
      const result = await response.json();

      if (result.success) {
        setSubmitMessage("Company profile updated successfully!");
        setErrors({});
        setTimeout(() => router.push("/company"), 2000);
      } else {
        setSubmitMessage(result.message || "Error updating profile.");
        if (result.errors) {
          setErrors(
            result.errors.reduce(
              (acc, err) => ({ ...acc, [err.field]: err.message }),
              {}
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSubmitMessage("Server error. Please try again later.");
    } finally {
      submitLoading.stopLoading();
    }
  };

  if (!initialCheckDone || profileLoading.isLoading) {
    return (
      <div>
        <Loader text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Edit Company Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>
            Company Name
            {companyName ? (
              <input value={companyName} disabled={true} />
            ) : (
              <div className="error">Company name cannot be displayed</div>
            )}
          </label>
        </div>

        <div className="form-field">
          <label>
            Tax ID Number*
            <input
              value={formData.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              placeholder="123456789"
            />
            {errors.taxId && <div className="error">{errors.taxId}</div>}
          </label>
        </div>

        <div className="form-field">
          <label>
            Street Address*
            <input
              value={formData.street}
              onChange={(e) => handleChange("street", e.target.value)}
              placeholder="Friedrichstrasse 123"
            />
            {errors.street && <div className="error">{errors.street}</div>}
          </label>
        </div>

        <div className="form-field">
          <label>
            City*
            <input
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Berlin"
            />
            {errors.city && <div className="error">{errors.city}</div>}
          </label>
        </div>

        <div className="form-field">
          <label>
            Postal Code*
            <input
              value={formData.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              placeholder="10117"
            />
            {errors.postalCode && (
              <div className="error">{errors.postalCode}</div>
            )}
          </label>
        </div>

        <div className="form-field">
          <label>
            Country
            <input
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="Germany"
            />
          </label>
        </div>

        <div className="form-field">
          <label>
            Phone Number
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+49 30 12345678"
            />
          </label>
        </div>

        <div className="form-field">
          <label>
            Contact Email
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="info@berlinmoving.de"
            />
          </label>
        </div>

        <div className="form-field">
          <div className="three-columns">
            <label htmlFor="service-area">Service Areas*</label>
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  serviceAreas: [
                    ...prev.serviceAreas,
                    { from: "Berlin", to: "Munich" },
                  ],
                }))
              }
            >
              Add New Area
            </button>
            <label>
              <input
                type="checkbox"
                checked={formData.isKisteKlarCertified}
                onChange={(e) =>
                  handleChange("isKisteKlarCertified", e.target.checked)
                }
              />
              KisteKlar Certified Company
            </label>
          </div>
          {formData.serviceAreas.map((area, index) => (
            <div key={index} className="service-area" id="service-area">
              <input
                value={area.from}
                onChange={(e) =>
                  updateServiceArea(index, "from", e.target.value)
                }
                placeholder="Berlin"
              />
              <span>→</span>
              <input
                value={area.to}
                onChange={(e) => updateServiceArea(index, "to", e.target.value)}
                placeholder="Hamburg"
              />
              {formData.serviceAreas.length > 1 && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    const areas = formData.serviceAreas.filter(
                      (_, i) => i !== index
                    );
                    setFormData((prev) => ({ ...prev, serviceAreas: areas }));
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {errors.serviceAreas && (
            <div className="error">{errors.serviceAreas}</div>
          )}
        </div>

        {formData.isKisteKlarCertified && (
          <div className="form-field">
            <label>
              KisteKlar Certificate (Upload new file to replace current)
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  handleChange(
                    "kisteKlarCertificate",
                    e.target.files[0] || null
                  )
                }
              />
              {errors.kisteKlarCertificate && (
                <div className="error">{errors.kisteKlarCertificate}</div>
              )}
            </label>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={submitLoading.isLoading}
          >
            {submitLoading.isLoading ? "Updating..." : "Update Profile"}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push("/company")}
            disabled={submitLoading.isLoading}
          >
            Cancel
          </button>
        </div>

        {submitMessage && (
          <div
            className={submitMessage.includes("success") ? "success" : "error"}
          >
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  );
}
