"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Form field configuration
const FORM_FIELDS = [
  {
    name: "companyName",
    label: "Company Name",
    required: true,
    placeholder: "Enter your company name",
  },
  {
    name: "taxId",
    label: "Tax ID Number",
    required: true,
    placeholder: "Enter your tax identification number",
  },
  {
    name: "street",
    label: "Street Address",
    required: true,
    placeholder: "Street and house number",
  },
  { name: "city", label: "City", required: true, placeholder: "City name" },
  {
    name: "postalCode",
    label: "Postal Code",
    required: true,
    placeholder: "12345",
  },
  { name: "country", label: "Country", placeholder: "Germany" },

  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+49 123 456789",
  },
  {
    name: "email",
    label: "Contact Email",
    type: "email",
    placeholder: "contact@company.com",
  },
];

const INITIAL_FORM_DATA = {
  companyName: "",
  taxId: "",
  street: "",
  city: "",
  postalCode: "",
  country: "Germany",
  phone: "",
  email: "",
  isKisteKlarCertified: false,
  serviceAreas: [{ from: "", to: "" }],
  businessLicense: null,
  kisteKlarCertificate: null,
};

// Extracted FormField component
const FormField = ({ field, value, onChange, errors }) => {
  const {
    name,
    label,
    type = "text",
    required = false,
    placeholder,
    rows,
    ...props
  } = field;

  return (
    <div className="form-field">
      <label>
        {label}
        {required && "*"}
        {type === "textarea" ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            rows={rows}
            {...props}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={(e) => onChange(name, e.target.value)}
            required={required}
            placeholder={placeholder}
            {...props}
          />
        )}
        {errors[name] && <div className="error">{errors[name]}</div>}
      </label>
    </div>
  );
};

export default function CompanyProfileEdit() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!account || account.role !== "company")) {
      router.push("/login");
      return;
    }

    if (!authLoading && account) {
      fetchCompanyProfile();
    }
  }, [account, authLoading, router]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/company/me");

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/company/setup");
          return;
        }
        throw new Error("Error loading company profile");
      }

      const result = await response.json();

      if (result.success && result.company) {
        const company = result.company;

        // Populate form with existing data
        setFormData({
          companyName: company.companyName || "",
          taxId: company.taxId || "",
          street: company.address?.street || "",
          city: company.address?.city || "",
          postalCode: company.address?.postalCode || "",
          country: company.address?.country || "Germany",
          phone: company.phone || "",
          email: company.email || "",
          isKisteKlarCertified: company.isKisteKlarCertified || false,
          serviceAreas:
            company.serviceAreas && company.serviceAreas.length > 0
              ? company.serviceAreas
              : [{ from: "", to: "" }],
          businessLicense: null, // Files are not pre-loaded
          kisteKlarCertificate: null,
        });
      }
    } catch (error) {
      console.error("Error loading company profile:", error);
      setSubmitMessage("Error loading company profile.");
    } finally {
      setLoading(false);
    }
  };

  // Generic input handler
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Service area handlers
  const updateServiceArea = (index, field, value) => {
    const updatedAreas = formData.serviceAreas.map((area, i) =>
      i === index ? { ...area, [field]: value } : area
    );
    setFormData((prev) => ({ ...prev, serviceAreas: updatedAreas }));
  };

  const addServiceArea = () => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, { from: "", to: "" }],
    }));
  };

  const removeServiceArea = (index) => {
    if (formData.serviceAreas.length > 1) {
      const updatedAreas = formData.serviceAreas.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, serviceAreas: updatedAreas }));
    }
  };

  // File upload handler
  const handleFileUpload = (name, file) => {
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    const requiredFields = [
      "companyName",
      "taxId",
      "street",
      "city",
      "postalCode",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = `${field} is required`;
      }
    });

    // Service areas validation
    const hasEmptyServiceArea = formData.serviceAreas.some(
      (area) => !area.from.trim() || !area.to.trim()
    );
    if (hasEmptyServiceArea) {
      newErrors.serviceAreas =
        "All service areas must have both from and to cities";
    }

    // KisteKlar certificate validation
    if (formData.isKisteKlarCertified && !formData.kisteKlarCertificate) {
      // Only require certificate if not already uploaded (this is an update)
      // In a real scenario, you'd check if certificate already exists
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create FormData for submission
  const createSubmissionData = () => {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (key === "serviceAreas") {
        data.append(key, JSON.stringify(value));
      } else if (key === "isKisteKlarCertified") {
        data.append(key, value.toString());
      } else if (key === "businessLicense" || key === "kisteKlarCertificate") {
        // Only append files if they're actually selected
        if (value instanceof File) {
          data.append(key, value);
        }
      } else {
        data.append(key, value);
      }
    });

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitMessage("Please fix the errors below.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/company/profile", {
        method: "PUT",
        body: createSubmissionData(),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage("Company profile updated successfully!");
        setErrors({});
        // Optionally redirect back to dashboard
        setTimeout(() => {
          router.push("/company");
        }, 2000);
      } else {
        setSubmitMessage(result.message || "Error updating profile.");
        if (result.errors) {
          const errorMap = result.errors.reduce(
            (acc, err) => ({ ...acc, [err.field]: err.message }),
            {}
          );
          setErrors(errorMap);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSubmitMessage("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/company");
  };

  if (authLoading || loading) {
    return (
      <div className="container">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Edit Company Profile</h1>
        <p>Update your company information and settings</p>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Basic Company Information */}
        <div className="form-section">
          <h2>Company Information</h2>
          {FORM_FIELDS.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={handleInputChange}
              errors={errors}
            />
          ))}
        </div>

        {/* Service Areas Section */}
        <div className="form-section">
          <h2>Service Areas</h2>
          <div className="form-field">
            <label>
              Service Areas*&nbsp;
              <button
                type="button"
                className="btn-secondary"
                onClick={addServiceArea}
              >
                Add New Area
              </button>
            </label>
            {formData.serviceAreas.map((area, index) => (
              <div key={index} className="service-area">
                <input
                  type="text"
                  value={area.from}
                  onChange={(e) =>
                    updateServiceArea(index, "from", e.target.value)
                  }
                  placeholder="Starting city"
                  required
                />
                <span>→</span>
                <input
                  type="text"
                  value={area.to}
                  onChange={(e) =>
                    updateServiceArea(index, "to", e.target.value)
                  }
                  placeholder="Destination city"
                  required
                />
                {formData.serviceAreas.length > 1 && (
                  <button
                    className="btn-danger"
                    type="button"
                    onClick={() => removeServiceArea(index)}
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
        </div>

        {/* Certification Section */}
        <div className="form-section">
          <h2>Certifications</h2>

          {/* KisteKlar certification checkbox */}
          <div className="checkbox-field">
            <input
              type="checkbox"
              name="isKisteKlarCertified"
              checked={formData.isKisteKlarCertified}
              onChange={(e) =>
                handleInputChange("isKisteKlarCertified", e.target.checked)
              }
            />
            <label>KisteKlar Certified Company</label>
          </div>

          {/* File upload fields */}
          <div className="form-field">
            <label>
              Business License (Upload new file to replace current)
              <input
                type="file"
                name="businessLicense"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  handleFileUpload("businessLicense", e.target.files[0] || null)
                }
              />
              {errors.businessLicense && (
                <div className="error">{errors.businessLicense}</div>
              )}
            </label>
          </div>

          {formData.isKisteKlarCertified && (
            <div className="form-field">
              <label>
                KisteKlar Certificate (Upload new file to replace current)
                <input
                  type="file"
                  name="kisteKlarCertificate"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFileUpload(
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
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Profile"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
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
