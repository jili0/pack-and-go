// src/components/forms/AddressForm.jsx
"use client";

import { useState } from "react";

const AddressForm = ({
  label,
  initialValues = {},
  onChange,
  error,
  className = "",
}) => {
  const [address, setAddress] = useState({
    street: initialValues.street || "",
    city: initialValues.city || "",
    postalCode: initialValues.postalCode || "",
    country: initialValues.country || "Germany",
    ...initialValues,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedAddress = { ...address, [name]: value };
    setAddress(updatedAddress);

    if (onChange) {
      onChange(updatedAddress);
    }
  };

  return (
    <div className={`${styles.addressForm} ${className}`}>
      {label && <h3>{label}</h3>}

      <div>
        <div>
          <label htmlFor={`street-${label}`}>Street and Number</label>
          <input
            type="text"
            id={`street-${label}`}
            name="street"
            value={address.street}
            onChange={handleChange}
            className={`${styles.input} ${error ? styles.inputError : ""}`}
            placeholder="Example Street 123"
          />
        </div>

        <div>
          <div>
            <label htmlFor={`postalCode-${label}`}>Postal Code</label>
            <input
              type="text"
              id={`postalCode-${label}`}
              name="postalCode"
              value={address.postalCode}
              onChange={handleChange}
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder="12345"
            />
          </div>

          <div>
            <label htmlFor={`city-${label}`}>City</label>
            <input
              type="text"
              id={`city-${label}`}
              name="city"
              value={address.city}
              onChange={handleChange}
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder="Berlin"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`country-${label}`}>Country</label>
          <select
            id={`country-${label}`}
            name="country"
            value={address.country}
            onChange={handleChange}
          >
            <option value="Germany">Germany</option>
            <option value="Austria">Austria</option>
            <option value="Switzerland">Switzerland</option>
            <option value="France">France</option>
            <option value="Italy">Italy</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Belgium">Belgium</option>
            <option value="Luxembourg">Luxembourg</option>
            <option value="Denmark">Denmark</option>
            <option value="Poland">Poland</option>
            <option value="Czech Republic">Czech Republic</option>
            <option value="Spain">Spain</option>
            <option value="Portugal">Portugal</option>
            <option value="United Kingdom">United Kingdom</option>
          </select>
        </div>
      </div>

      {error && <p>{error}</p>}
    </div>
  );
};

export default AddressForm;
