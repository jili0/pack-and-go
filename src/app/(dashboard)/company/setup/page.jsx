"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/styles/styles.css";

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
];

const INITIAL_FORM_DATA = {
  companyName: "",
  taxId: "",
  street: "",
  city: "",
  postalCode: "",
  country: "Germany",
  isKisteKlarCertified: false,
  serviceAreas: [{ from: "", to: "" }],
  businessLicense: null,
  kisteKlarCertificate: null,
};

// Extracted FormField component outside of main component
const FormField = ({ field, value, onChange, errors }) => {
  const {
    name,
    label,
    type = "text",
    required = false,
    placeholder,
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
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            {...props}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
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

export default function CompanySetup() {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");

  // Generic input handler
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (formData.isKisteKlarCertified && !formData.kisteKlarCertificate) {
      setSubmitMessage("Please upload your KisteKlar certificate.");
      return false;
    }
    return true;
  };

  // Create FormData for submission
  const createSubmissionData = () => {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value === null) return;

      if (key === "serviceAreas") {
        data.append(key, JSON.stringify(value));
      } else if (key === "isKisteKlarCertified") {
        data.append(key, value.toString());
      } else {
        data.append(key, value);
      }
    });

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch("/api/company/setup", {
        method: "POST",
        body: createSubmissionData(),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage("Company profile created successfully!");
        setErrors({});
        router.push("/company");
      } else {
        setSubmitMessage(result.message || "Error creating profile.");
        if (result.errors) {
          const errorMap = result.errors.reduce(
            (acc, err) => ({ ...acc, [err.field]: err.message }),
            {}
          );
          setErrors(errorMap);
        }
      }
    } catch (error) {
      setSubmitMessage("Server error. Please try again later.");
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <h2>Create your company profile</h2>

      {/* Render all basic form fields */}
      {FORM_FIELDS.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={formData[field.name]}
          onChange={handleInputChange}
          errors={errors}
        />
      ))}

      {/* Service areas section */}
      <div className="form-field">
        <label>
          Service area*{" "}
          <button
            type="button"
            className="btn-primary"
            onClick={addServiceArea}
          >
            Add New
          </button>
        </label>
        {formData.serviceAreas.map((area, index) => (
          <div key={index} className="service-area ">
            <input
              type="text"
              value={area.from}
              onChange={(e) => updateServiceArea(index, "from", e.target.value)}
              placeholder="Starting city"
            />
            <input
              type="text"
              value={area.to}
              onChange={(e) => updateServiceArea(index, "to", e.target.value)}
              placeholder="Destination city"
            />

            {formData.serviceAreas.length > 1 && (
              <button
                className="btn-primary"
                type="button"
                onClick={() => removeServiceArea(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

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
          Business License*
          <input
            type="file"
            name="businessLicense"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) =>
              handleFileUpload("businessLicense", e.target.files[0] || null)
            }
            required
          />
          {errors.businessLicense && (
            <div className="error">{errors.businessLicense}</div>
          )}
        </label>
      </div>

      {formData.isKisteKlarCertified && (
        <div className="form-field">
          <label>
            KisteKlar Certificate*
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
              required
            />
            {errors.kisteKlarCertificate && (
              <div className="error">{errors.kisteKlarCertificate}</div>
            )}
          </label>
        </div>
      )}

      <button type="submit" className="btn-primary">
        Create Company Profile
      </button>

      {submitMessage && (
        <div
          className={submitMessage.includes("success") ? "success" : "error"}
        >
          {submitMessage}
        </div>
      )}
    </form>
  );
}