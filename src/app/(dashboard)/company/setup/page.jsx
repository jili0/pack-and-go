"use client"; // Damit React Hooks funktionieren

import { useState } from "react";
import "@/app/styles/companySetup.css";


export default function CompanySetup() {
  const [formData, setFormData] = useState({
    companyName: "",
    taxId: "",
    description: "",
    hourlyRate: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Deutschland",
    isKisteKlarCertified: false,
    serviceAreas: [{ from: "", to: "" }],
    businessLicense: null,
    kisteKlarCertificate: null,
  });

  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");

  // Einfaches Handling der Input-Änderungen
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  // Service Areas ändern
  function handleServiceAreaChange(index, field, value) {
    const newServiceAreas = [...formData.serviceAreas];
    newServiceAreas[index][field] = value;
    setFormData((prev) => ({ ...prev, serviceAreas: newServiceAreas }));
  }

  function addServiceArea() {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, { from: "", to: "" }],
    }));
  }

  function removeServiceArea(index) {
    const newServiceAreas = formData.serviceAreas.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, serviceAreas: newServiceAreas }));
  }

  // File Inputs
  function handleFileChange(e) {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Formdata vorbereiten für multipart/form-data
    const data = new FormData();

    data.append("companyName", formData.companyName);
    data.append("taxId", formData.taxId);
    data.append("description", formData.description);
    data.append("hourlyRate", formData.hourlyRate);
    data.append("street", formData.street);
    data.append("city", formData.city);
    data.append("postalCode", formData.postalCode);
    data.append("country", formData.country);
    data.append("isKisteKlarCertified", formData.isKisteKlarCertified);

    data.append("businessLicense", formData.businessLicense);

    if (formData.isKisteKlarCertified) {
      if (!formData.kisteKlarCertificate) {
        setSubmitMessage("KisteKlar-Zertifikat ist erforderlich, wenn Zertifizierung ausgewählt ist.");
        return;
      }
      data.append("kisteKlarCertificate", formData.kisteKlarCertificate);
    }

    data.append("serviceAreas", JSON.stringify(formData.serviceAreas));

    try {
      const res = await fetch("/api/company/setup", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        setSubmitMessage("Firmenprofil erfolgreich erstellt!");
        setErrors({});
      } else {
        setSubmitMessage(result.message || "Fehler beim Erstellen des Profils.");
        if (result.errors) {
          setErrors(result.errors.reduce((acc, err) => ({ ...acc, [err.field]: err.message }), {}));
        }
      }
    } catch (error) {
      setSubmitMessage("Serverfehler. Bitte später erneut versuchen.");
    }
  }

  return (
    <div className="company-setup-container">
      <h1>Firmenprofil erstellen</h1>
      <form onSubmit={handleSubmit} className="company-setup-form" encType="multipart/form-data">
        <label>
          Firmenname*:
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
          {errors.companyName && <div className="error">{errors.companyName}</div>}
        </label>

        <label>
          Steuernummer*:
          <input
            type="text"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            required
          />
          {errors.taxId && <div className="error">{errors.taxId}</div>}
        </label>

        <label>
          Beschreibung:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={500}
            rows={4}
          />
          {errors.description && <div className="error">{errors.description}</div>}
        </label>

        <label>
          Stundensatz (€)*:
          <input
            type="number"
            name="hourlyRate"
            min="0"
            step="0.01"
            value={formData.hourlyRate}
            onChange={handleChange}
            required
          />
          {errors.hourlyRate && <div className="error">{errors.hourlyRate}</div>}
        </label>

        <fieldset>
          <legend>Adresse</legend>

          <label>
            Straße*:
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
            />
            {errors.street && <div className="error">{errors.street}</div>}
          </label>

          <label>
            Stadt*:
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            {errors.city && <div className="error">{errors.city}</div>}
          </label>

          <label>
            Postleitzahl*:
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
            />
            {errors.postalCode && <div className="error">{errors.postalCode}</div>}
          </label>

          <label>
            Land:
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </label>
        </fieldset>

        <label>
          Zertifiziert bei KisteKlar:
          <input
            type="checkbox"
            name="isKisteKlarCertified"
            checked={formData.isKisteKlarCertified}
            onChange={handleChange}
          />
        </label>

        <fieldset>
          <legend>Servicegebiete</legend>
          {formData.serviceAreas.map((area, index) => (
            <div key={index} className="service-area">
              <label>
                Von:
                <input
                  type="text"
                  value={area.from}
                  onChange={(e) => handleServiceAreaChange(index, "from", e.target.value)}
                />
              </label>
              <label>
                Bis:
                <input
                  type="text"
                  value={area.to}
                  onChange={(e) => handleServiceAreaChange(index, "to", e.target.value)}
                />
              </label>
              <button type="button" onClick={() => removeServiceArea(index)} className="remove-area-btn">
                Entfernen
              </button>
            </div>
          ))}
          <button type="button" onClick={addServiceArea} className="add-area-btn">
            Servicegebiet hinzufügen
          </button>
        </fieldset>

        <label>
          Betriebsausweis*:
          <input
            type="file"
            name="businessLicense"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            required
          />
          {errors.businessLicense && <div className="error">{errors.businessLicense}</div>}
        </label>

        {formData.isKisteKlarCertified && (
          <label>
            KisteKlar-Zertifikat*:
            <input
              type="file"
              name="kisteKlarCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required={formData.isKisteKlarCertified}
            />
            {errors.kisteKlarCertificate && <div className="error">{errors.kisteKlarCertificate}</div>}
          </label>
        )}

        <button type="submit" className="submit-btn">
          Profil erstellen
        </button>

        {submitMessage && <p className="submit-message">{submitMessage}</p>}
      </form>
    </div>
  );
}
