"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanySetup() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyName: "",
    taxId: "",
    description: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Germany",
    isKisteKlarCertified: false,
    serviceAreas: [{ from: "", to: "" }],
    businessLicense: null,
    kisteKlarCertificate: null,
  });

  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleServiceAreaChange(index, field, value) {
    const updatedAreas = [...formData.serviceAreas];
    updatedAreas[index][field] = value;
    setFormData((prev) => ({ ...prev, serviceAreas: updatedAreas }));
  }

  function addServiceArea() {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, { from: "", to: "" }],
    }));
  }

  function removeServiceArea(index) {
    const updated = formData.serviceAreas.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, serviceAreas: updated }));
  }

  function handleFileChange(e) {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const data = new FormData();
    data.append("companyName", formData.companyName);
    data.append("taxId", formData.taxId);
    data.append("description", formData.description);
    data.append("street", formData.street);
    data.append("city", formData.city);
    data.append("postalCode", formData.postalCode);
    data.append("country", formData.country);
    data.append(
      "isKisteKlarCertified",
      formData.isKisteKlarCertified ? "true" : "false"
    );
    data.append("businessLicense", formData.businessLicense);
    data.append("serviceAreas", JSON.stringify(formData.serviceAreas));

    if (formData.isKisteKlarCertified) {
      if (!formData.kisteKlarCertificate) {
        setSubmitMessage("Please upload your KisteKlar certificate.");
        return;
      }
      data.append("kisteKlarCertificate", formData.kisteKlarCertificate);
    }

    try {
      const res = await fetch("/api/company/setup", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        setSubmitMessage("Company profile created successfully!");
        setErrors({});
        router.push("/company"); // Redirect to dashboard
      } else {
        setSubmitMessage(result.message || "Error creating profile.");
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
      setSubmitMessage("Server error. Please try again later.");
    }
  }

  return (
    <div>
      <div>
        <h1>Create Your Company Profile</h1>
        <p>
          Join Pack & Go as a verified moving company and connect with customers
          looking for professional moving services.
        </p>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <h2>Company Information</h2>

          <div>
            <label>
              Company Name*
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Enter your company name"
              />
              {errors.companyName && <div>{errors.companyName}</div>}
            </label>
          </div>

          <div>
            <label>
              Tax ID Number*
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                required
                placeholder="Enter your tax identification number"
              />
              {errors.taxId && <div>{errors.taxId}</div>}
            </label>
          </div>

          <div>
            <label>
              Company Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                placeholder="Describe your moving services, experience, and what makes your company special..."
              />
              <small>{formData.description.length}/500 characters</small>
              {errors.description && <div>{errors.description}</div>}
            </label>
          </div>

          <div></div>
        </div>

        <div>
          <h2>Business Address</h2>

          <div>
            <div>
              <label>
                Street Address*
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  placeholder="Street and house number"
                />
                {errors.street && <div>{errors.street}</div>}
              </label>
            </div>
          </div>

          <div>
            <div>
              <label>
                City*
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="City name"
                />
                {errors.city && <div>{errors.city}</div>}
              </label>
            </div>

            <div>
              <label>
                Postal Code*
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  placeholder="12345"
                />
                {errors.postalCode && <div>{errors.postalCode}</div>}
              </label>
            </div>
          </div>

          <div>
            <label>
              Country
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Germany"
              />
            </label>
          </div>
        </div>

        <div>
          <h2>Certification</h2>

          <div>
            <label>
              <input
                type="checkbox"
                name="isKisteKlarCertified"
                checked={formData.isKisteKlarCertified}
                onChange={handleChange}
              />
              <span></span>
              KisteKlar Certified Company
              <small>
                KisteKlar certification guarantees the highest quality standards
                and builds customer trust.
              </small>
            </label>
          </div>
        </div>

        <div>
          <h2>Service Areas</h2>
          <p>Define the areas where you provide moving services.</p>

          {formData.serviceAreas.map((area, index) => (
            <div key={index}>
              <div>
                <div>
                  <label>
                    From
                    <input
                      type="text"
                      value={area.from}
                      onChange={(e) =>
                        handleServiceAreaChange(index, "from", e.target.value)
                      }
                      placeholder="Starting location"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    To
                    <input
                      type="text"
                      value={area.to}
                      onChange={(e) =>
                        handleServiceAreaChange(index, "to", e.target.value)
                      }
                      placeholder="Destination area"
                    />
                  </label>
                </div>
              </div>
              {formData.serviceAreas.length > 1 && (
                <button type="button" onClick={() => removeServiceArea(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addServiceArea}>
            + Add Service Area
          </button>
        </div>

        <div>
          <h2>Required Documents</h2>

          <div>
            <label>
              Business License*
              <input
                type="file"
                name="businessLicense"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
              />
              <small>
                Upload your business license or trade registration (PDF, JPG,
                PNG)
              </small>
              {errors.businessLicense && <div>{errors.businessLicense}</div>}
            </label>
          </div>

          {formData.isKisteKlarCertified && (
            <div>
              <label>
                KisteKlar Certificate*
                <input
                  type="file"
                  name="kisteKlarCertificate"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                />
                <small>Upload your KisteKlar certification document</small>
                {errors.kisteKlarCertificate && (
                  <div>{errors.kisteKlarCertificate}</div>
                )}
              </label>
            </div>
          )}
        </div>

        <div>
          <button type="submit">Create Company Profile</button>
          {submitMessage && <div>{submitMessage}</div>}
        </div>
      </form>
    </div>
  );
}
