// src/components/forms/AddressForm.jsx
'use client';

import { useState } from 'react';

const AddressForm = ({ 
  label, 
  initialValues = {}, 
  onChange, 
  error,
  className = '' 
}) => {
  const [address, setAddress] = useState({
    street: initialValues.street || '',
    city: initialValues.city || '',
    postalCode: initialValues.postalCode || '',
    country: initialValues.country || 'Deutschland',
    ...initialValues
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
    <div className={`space-y-4 ${className}`}>
      {label && <h3 className="text-lg font-medium text-gray-700">{label}</h3>}
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor={`street-${label}`} className="block text-sm font-medium text-gray-700">
            Straße und Hausnummer
          </label>
          <input
            type="text"
            id={`street-${label}`}
            name="street"
            value={address.street}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              error ? 'border-red-500' : ''
            }`}
            placeholder="Musterstraße 123"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`postalCode-${label}`} className="block text-sm font-medium text-gray-700">
              PLZ
            </label>
            <input
              type="text"
              id={`postalCode-${label}`}
              name="postalCode"
              value={address.postalCode}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                error ? 'border-red-500' : ''
              }`}
              placeholder="12345"
            />
          </div>
          
          <div>
            <label htmlFor={`city-${label}`} className="block text-sm font-medium text-gray-700">
              Stadt
            </label>
            <input
              type="text"
              id={`city-${label}`}
              name="city"
              value={address.city}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                error ? 'border-red-500' : ''
              }`}
              placeholder="Berlin"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor={`country-${label}`} className="block text-sm font-medium text-gray-700">
            Land
          </label>
          <select
            id={`country-${label}`}
            name="country"
            value={address.country}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Deutschland">Deutschland</option>
            <option value="Österreich">Österreich</option>
            <option value="Schweiz">Schweiz</option>
            <option value="Frankreich">Frankreich</option>
            <option value="Italien">Italien</option>
            <option value="Niederlande">Niederlande</option>
            <option value="Belgien">Belgien</option>
            <option value="Luxemburg">Luxemburg</option>
            <option value="Dänemark">Dänemark</option>
            <option value="Polen">Polen</option>
            <option value="Tschechien">Tschechien</option>
            <option value="Spanien">Spanien</option>
            <option value="Portugal">Portugal</option>
            <option value="Vereinigtes Königreich">Vereinigtes Königreich</option>
          </select>
        </div>
      </div>
      
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default AddressForm;