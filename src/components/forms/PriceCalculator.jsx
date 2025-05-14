// src/components/forms/MovingCalculator.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddressForm from './AddressForm';
import { useAuth } from '@/context/AuthContext';

const MovingCalculator = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fromAddress: {},
    toAddress: {},
    helpersCount: 2,
    estimatedHours: 4,
    preferredDates: ['', '', '']
  });
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Berechne den Gesamtpreis basierend auf Stunden und Helfer
  useEffect(() => {
    // Preis pro Stunde für 2 Helfer: 100€
    const hourlyRate = 50; // Preis pro Helfer pro Stunde
    const calculatedPrice = formData.helpersCount * formData.estimatedHours * hourlyRate;
    setTotalPrice(calculatedPrice);
  }, [formData.helpersCount, formData.estimatedHours]);
  
  const handleFromAddressChange = (address) => {
    setFormData({ ...formData, fromAddress: address });
    if (errors.fromAddress) {
      setErrors({ ...errors, fromAddress: null });
    }
  };
  
  const handleToAddressChange = (address) => {
    setFormData({ ...formData, toAddress: address });
    if (errors.toAddress) {
      setErrors({ ...errors, toAddress: null });
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value, 10) });
  };
  
  const handleDateChange = (index, value) => {
    const newDates = [...formData.preferredDates];
    newDates[index] = value;
    setFormData({ ...formData, preferredDates: newDates });
    
    if (errors.preferredDates) {
      setErrors({ ...errors, preferredDates: null });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Adressvalidierung
    if (!formData.fromAddress.street || !formData.fromAddress.city || !formData.fromAddress.postalCode) {
      newErrors.fromAddress = 'Bitte geben Sie eine vollständige Adresse ein';
    }
    
    if (!formData.toAddress.street || !formData.toAddress.city || !formData.toAddress.postalCode) {
      newErrors.toAddress = 'Bitte geben Sie eine vollständige Adresse ein';
    }
    
    // Wunschdatumvalidierung - mindestens ein Datum muss ausgewählt sein
    if (!formData.preferredDates.some(date => date)) {
      newErrors.preferredDates = 'Bitte wählen Sie mindestens ein Wunschdatum aus';
    }
    
    // Validiere, dass die Datumsangaben in der Zukunft liegen
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    formData.preferredDates.forEach((date, index) => {
      if (date) {
        const selectedDate = new Date(date);
        if (selectedDate < today) {
          newErrors[`date${index}`] = 'Das Datum muss in der Zukunft liegen';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    // Überprüfen, ob der Benutzer angemeldet ist
    if (!user) {
      // Formularparameter in URL-Parameter umwandeln und zur Anmeldeseite weiterleiten
      sessionStorage.setItem('movingFormData', JSON.stringify({
        ...formData,
        totalPrice
      }));
      
      router.push('/login?redirect=search-companies');
      return;
    }
    
    try {
      // Suche nach passenden Umzugsfirmen
      const response = await fetch('/api/companies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCity: formData.fromAddress.city,
          toCity: formData.toAddress.city,
          helpersCount: formData.helpersCount,
          estimatedHours: formData.estimatedHours
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Speichere die Suchanfrage und Ergebnisse im Session Storage
        sessionStorage.setItem('movingFormData', JSON.stringify({
          ...formData,
          totalPrice
        }));
        
        sessionStorage.setItem('searchResults', JSON.stringify(data.companies));
        
        // Weiterleitung zur Ergebnisseite
        router.push('/search-results');
      } else {
        setErrors({ submit: data.message || 'Ein Fehler ist aufgetreten' });
      }
    } catch (error) {
      console.error('Fehler bei der Suche nach Umzugsfirmen:', error);
      setErrors({ submit: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Umzug planen</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <AddressForm
            label="Ich ziehe um von"
            onChange={handleFromAddressChange}
            error={errors.fromAddress}
          />
          
          <AddressForm
            label="Ich ziehe um nach"
            onChange={handleToAddressChange}
            error={errors.toAddress}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anzahl der Helfer
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => formData.helpersCount > 1 && 
                  setFormData({ ...formData, helpersCount: formData.helpersCount - 1 })}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-l"
              >
                -
              </button>
              <input
                type="number"
                name="helpersCount"
                min="1"
                max="10"
                value={formData.helpersCount}
                onChange={handleInputChange}
                className="w-16 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                readOnly
              />
              <button
                type="button"
                onClick={() => formData.helpersCount < 10 && 
                  setFormData({ ...formData, helpersCount: formData.helpersCount + 1 })}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r"
              >
                +
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geschätzte Stunden
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => formData.estimatedHours > 1 && 
                  setFormData({ ...formData, estimatedHours: formData.estimatedHours - 1 })}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-l"
              >
                -
              </button>
              <input
                type="number"
                name="estimatedHours"
                min="1"
                max="24"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                className="w-16 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                readOnly
              />
              <button
                type="button"
                onClick={() => formData.estimatedHours < 24 && 
                  setFormData({ ...formData, estimatedHours: formData.estimatedHours + 1 })}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Wunschdatum (bis zu 3)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label className={`block text-sm font-medium ${index === 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                  {index === 0 ? 'Bevorzugtes Datum*' : `Alternative ${index}`}
                </label>
                <input
                  type="date"
                  value={formData.preferredDates[index]}
                  onChange={(e) => handleDateChange(index, e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors[`date${index}`] ? 'border-red-500' : ''
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                  required={index === 0}
                />
                {errors[`date${index}`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`date${index}`]}</p>
                )}
              </div>
            ))}
          </div>
          {errors.preferredDates && (
            <p className="mt-2 text-sm text-red-600">{errors.preferredDates}</p>
          )}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Geschätzter Preis:</span>
            <span className="text-2xl font-bold text-blue-700">{totalPrice} €</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Basierend auf {formData.helpersCount} Helfer für {formData.estimatedHours} Stunden 
            à 50 € pro Helfer pro Stunde
          </p>
        </div>
        
        {errors.submit && (
          <div className="bg-red-50 p-4 rounded-md mb-6 text-red-700">
            {errors.submit}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Suche nach passenden Umzugsfirmen...
            </span>
          ) : (
            'Passende Umzugsfirmen finden'
          )}
        </button>
      </form>
    </div>
  );
};

export default MovingCalculator;