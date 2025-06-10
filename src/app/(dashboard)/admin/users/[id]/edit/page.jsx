'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from "@/app/styles/AdminUsersEdit.module.css";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    role: 'user'
  });

  // Company form data state
  const [companyFormData, setCompanyFormData] = useState({
    companyName: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: ''
    },
    taxId: '',
    description: '',
    hourlyRate: 0,
    isVerified: false,
    isKisteKlarCertified: false
  });

  // Service areas state
  const [serviceAreas, setServiceAreas] = useState([]);
  const [newServiceArea, setNewServiceArea] = useState({ from: '', to: '' });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user data
      const userResponse = await fetch(`/api/admin/users/${userId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      const responseData = await userResponse.json();
      
      // Extract user data from API response
      const userData = responseData.user || responseData;
      const companyDetails = responseData.companyDetails;
      
      setUser(userData);
      
      // Set basic user form data with existing values
      setFormData({
        email: userData.email || '',
        name: userData.name || '',
        phone: userData.phone || '',
        role: userData.role || 'user'
      });

      // If user is a company and we have company details
      if (userData.role === 'company') {
        if (companyDetails) {
          // Use company details from the user API response
          setCompanyData(companyDetails);
          
          setCompanyFormData({
            companyName: companyDetails.companyName || '',
            address: {
              street: companyDetails.address?.street || '',
              city: companyDetails.address?.city || '',
              postalCode: companyDetails.address?.postalCode || '',
              country: companyDetails.address?.country || ''
            },
            taxId: companyDetails.taxId || '',
            description: companyDetails.description || '',
            hourlyRate: companyDetails.hourlyRate || 0,
            isVerified: companyDetails.isVerified || false,
            isKisteKlarCertified: companyDetails.isKisteKlarCertified || false
          });

          setServiceAreas(companyDetails.serviceAreas || []);
        } else {
          // Fallback: fetch company data separately if not included
          try {
            const companyResponse = await fetch(`/api/admin/companies/by-user/${userId}`);
            if (companyResponse.ok) {
              const companyData = await companyResponse.json();
              setCompanyData(companyData);
              
              setCompanyFormData({
                companyName: companyData.companyName || '',
                address: {
                  street: companyData.address?.street || '',
                  city: companyData.address?.city || '',
                  postalCode: companyData.address?.postalCode || '',
                  country: companyData.address?.country || ''
                },
                taxId: companyData.taxId || '',
                description: companyData.description || '',
                hourlyRate: companyData.hourlyRate || 0,
                isVerified: companyData.isVerified || false,
                isKisteKlarCertified: companyData.isKisteKlarCertified || false
              });

              setServiceAreas(companyData.serviceAreas || []);
            }
          } catch (companyErr) {
            console.log('Could not fetch company data:', companyErr.message);
          }
        }
      }
    } catch (err) {
      setError('Failed to load user data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCompanyInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setCompanyFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setCompanyFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
      }));
    }
  };

  const addServiceArea = () => {
    if (newServiceArea.from && newServiceArea.to) {
      setServiceAreas(prev => [...prev, { ...newServiceArea, _id: Date.now().toString() }]);
      setNewServiceArea({ from: '', to: '' });
    }
  };

  const removeServiceArea = (id) => {
    setServiceAreas(prev => prev.filter(area => area._id !== id));
  };

  const handleResetPassword = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Password reset successfully! Temporary password: ${data.tempPassword} (for ${data.userEmail})`);
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Validate new password if provided
      if (formData.newPassword && formData.newPassword.trim() !== "" && formData.newPassword.length < 6) {
        setError("New password must be at least 6 characters long");
        return;
      }

      // Update user basic info first
      const userResponse = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'updateProfile',
          name: formData.name,
          phone: formData.phone
        })
      });

      if (!userResponse.ok) {
        throw new Error('Failed to update user profile');
      }

      // Update role if it changed
      if (formData.role !== user.role) {
        const roleResponse = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'changeRole',
            role: formData.role
          })
        });

        if (!roleResponse.ok) {
          throw new Error('Failed to update user role');
        }
      }

      // If company, update company data
      if (formData.role === 'company' && companyData) {
        const companyUpdateData = {
          ...companyFormData,
          serviceAreas: serviceAreas
        };

        const companyResponse = await fetch(`/api/admin/companies/${companyData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(companyUpdateData)
        });

        if (!companyResponse.ok) {
          throw new Error('Failed to update company data');
        }
      }

      setSuccess('User data updated successfully');
      
      // Refresh data to show updated info
      await fetchUserData();
      
      // Redirect back to users list after 3 seconds
      setTimeout(() => {
        router.push('/admin');
      }, 3000);

    } catch (err) {
      setError('Failed to update user: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading user data...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>User not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Edit User</h1>
          {user && (
            <p className={styles.userInfo}>
              Editing: {user.name} ({user.email}) - {user.role}
            </p>
          )}
        </div>
        <button 
          className={styles.backButton}
          onClick={() => router.push('/admin')}
        >
          ← Back to Users
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic User Information */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.disabledInput}
              disabled
              title="Email cannot be changed for security reasons"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="user">User</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password Reset */}
          <div className={styles.field}>
            <label className={styles.label}>Current Password</label>
            <div className={styles.passwordField}>
              <input
                type="password"
                value="••••••••••••"
                disabled
                className={styles.disabledInput}
              />
              <button
                type="button"
                onClick={handleResetPassword}
                className={styles.resetButton}
                disabled={saving}
              >
                Reset Password
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div className={styles.field}>
            <label className={styles.label}>New Password (Optional)</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter new password to change it"
              minLength="6"
            />
            <small className={styles.fieldHelp}>
              Leave empty to keep current password. Minimum 6 characters.
            </small>
          </div>
        </div>

        {/* User Statistics (for regular users) */}
        {user.role === 'user' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>User Statistics</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Reviews:</span>
                <span className={styles.statValue}>{user.reviews?.length || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Orders:</span>
                <span className={styles.statValue}>{user.orders?.length || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Company Information (only for company accounts) */}
        {formData.role === 'company' && companyData && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Company Information</h2>
            
            <div className={styles.field}>
              <label className={styles.label}>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={companyFormData.companyName}
                onChange={handleCompanyInputChange}
                className={styles.input}
              />
            </div>

            <div className={styles.addressGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={companyFormData.address.street}
                  onChange={handleCompanyInputChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={companyFormData.address.city}
                  onChange={handleCompanyInputChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Postal Code</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={companyFormData.address.postalCode}
                  onChange={handleCompanyInputChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={companyFormData.address.country}
                  onChange={handleCompanyInputChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tax ID</label>
              <input
                type="text"
                name="taxId"
                value={companyFormData.taxId}
                onChange={handleCompanyInputChange}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Hourly Rate (€)</label>
              <input
                type="number"
                name="hourlyRate"
                value={companyFormData.hourlyRate}
                onChange={handleCompanyInputChange}
                className={styles.input}
                min="0"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                name="description"
                value={companyFormData.description}
                onChange={handleCompanyInputChange}
                className={styles.textarea}
                rows="4"
              />
            </div>

            {/* Service Areas */}
            <div className={styles.field}>
              <label className={styles.label}>Service Areas</label>
              <div className={styles.serviceAreasContainer}>
                {serviceAreas.map((area) => (
                  <div key={area._id} className={styles.serviceAreaItem}>
                    <span>{area.from} → {area.to}</span>
                    <button
                      type="button"
                      onClick={() => removeServiceArea(area._id)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className={styles.addServiceArea}>
                  <input
                    type="text"
                    placeholder="From"
                    value={newServiceArea.from}
                    onChange={(e) => setNewServiceArea(prev => ({ ...prev, from: e.target.value }))}
                    className={styles.smallInput}
                  />
                  <input
                    type="text"
                    placeholder="To"
                    value={newServiceArea.to}
                    onChange={(e) => setNewServiceArea(prev => ({ ...prev, to: e.target.value }))}
                    className={styles.smallInput}
                  />
                  <button
                    type="button"
                    onClick={addServiceArea}
                    className={styles.addButton}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className={styles.checkboxGrid}>
              <div className={styles.checkboxField}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={companyFormData.isVerified}
                    onChange={handleCompanyInputChange}
                    className={styles.checkbox}
                  />
                  Verified Company
                </label>
              </div>
              <div className={styles.checkboxField}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isKisteKlarCertified"
                    checked={companyFormData.isKisteKlarCertified}
                    onChange={handleCompanyInputChange}
                    className={styles.checkbox}
                  />
                  KisteKlar Certified
                </label>
              </div>
            </div>

            {/* Company Statistics */}
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Average Rating:</span>
                <span className={styles.statValue}>{companyData.averageRating || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Reviews Count:</span>
                <span className={styles.statValue}>{companyData.reviewsCount || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}