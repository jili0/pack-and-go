"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";
import "@/app/styles/styles.css";

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id;

  const accountLoading = useLoading("api", "account");
  const saveLoading = useLoading("api", "save");
  const resetPasswordLoading = useLoading("api", "resetPassword");

  const [account, setAccount] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    role: "user",
  });

  const [companyFormData, setCompanyFormData] = useState({
    companyName: "",
    address: { street: "", city: "", postalCode: "", country: "" },
    taxId: "",
    description: "",
    isVerified: false,
    isKisteKlarCertified: false,
  });

  const [serviceAreas, setServiceAreas] = useState([]);
  const [newServiceArea, setNewServiceArea] = useState({ from: "", to: "" });

  useEffect(() => {
    fetchAccountData();
  }, [accountId]);

  const fetchAccountData = async () => {
    accountLoading.startLoading();
    try {
      const response = await fetch(`/api/admin/accounts/${accountId}`);

      if (!response.ok) {
        throw new Error("Error loading account data");
      }

      const data = await response.json();
      const accountData = data.account || data;
      const companyDetails = data.companyDetails;
      setAccount(accountData);

      setFormData({
        email: accountData.email || "",
        name: accountData.name || "",
        phone: accountData.phone || "",
        role: accountData.role || "user",
      });

      if (accountData.role === "company") {
        if (companyDetails) {
          setCompanyData(companyDetails);
          setCompanyFormData({
            companyName: companyDetails.companyName || "",
            address: {
              street: companyDetails.address?.street || "",
              city: companyDetails.address?.city || "",
              postalCode: companyDetails.address?.postalCode || "",
              country: companyDetails.address?.country || "",
            },
            taxId: companyDetails.taxId || "",
            description: companyDetails.description || "",
            isVerified: companyDetails.isVerified || false,
            isKisteKlarCertified: companyDetails.isKisteKlarCertified || false,
          });
          setServiceAreas(companyDetails.serviceAreas || []);
        } else {
          setCompanyData(null);
          setCompanyFormData({
            companyName: "",
            address: { street: "", city: "", postalCode: "", country: "" },
            taxId: "",
            description: "",
            isVerified: false,
            isKisteKlarCertified: false,
          });
          setServiceAreas([]);
        }
      }
    } catch (err) {
      setError("Error loading account data: " + err.message);
    } finally {
      accountLoading.stopLoading();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value || "",
    }));
  };

  const handleCompanyInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setCompanyFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setCompanyFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
              ? Number(value)
              : value,
      }));
    }
  };

  const addServiceArea = () => {
    if (newServiceArea.from && newServiceArea.to) {
      setServiceAreas((prev) => [
        ...prev,
        { ...newServiceArea, _id: Date.now().toString() },
      ]);
      setNewServiceArea({ from: "", to: "" });
    }
  };

  const removeServiceArea = (id) => {
    setServiceAreas((prev) => prev.filter((area) => area._id !== id));
  };

  const handleResetPassword = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to reset the password for ${account.name} (${account.email})?`
    );
    if (!confirmed) return;

    resetPasswordLoading.startLoading();
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/edit/${accountId}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Error resetting password");

      const data = await response.json();
      if (data.success) {
        setSuccess(
          `Password successfully reset! Temporary password: ${data.tempPassword}`
        );
      } else {
        throw new Error(data.message || "Error resetting password");
      }
    } catch (err) {
      setError("Error resetting password: " + err.message);
    } finally {
      resetPasswordLoading.stopLoading();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    saveLoading.startLoading();

    try {
      // Update basic profile
      const response = await fetch(`/api/admin/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProfile",
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (!response.ok) throw new Error("Error updating profile");

      // Update role if changed
      if (formData.role !== account.role) {
        const roleResponse = await fetch(`/api/admin/accounts/${accountId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "changeRole",
            role: formData.role,
          }),
        });

        if (!roleResponse.ok) throw new Error("Error changing role");
      }

      // Handle company data
      if (formData.role === "company") {
        if (companyData && companyData._id) {
          const companyResponse = await fetch(
            `/api/admin/companies/${companyData._id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...companyFormData, serviceAreas }),
            }
          );

          if (!companyResponse.ok)
            throw new Error("Error updating company data");
        } else {
          const companyResponse = await fetch(`/api/admin/companies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...companyFormData,
              serviceAreas,
              accountId: accountId,
            }),
          });

          if (!companyResponse.ok)
            throw new Error("Error creating company profile");
        }
      }

      setSuccess("Account data successfully updated");
      await fetchAccountData();
    } catch (err) {
      setError("Error updating: " + err.message);
    } finally {
      saveLoading.stopLoading();
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "user": return "Customer";
      case "company": return "Company";
      case "admin": return "Administrator";
      default: return role;
    }
  };

  const getAccountStatusBadge = () => {
    if (account.role === "company" && companyData) {
      return (
        <div className="status-badges">
          {companyData.isVerified && (
            <span className="badge verified">✓ Verified</span>
          )}
          {companyData.isKisteKlarCertified && (
            <span className="badge certified">★ KisteKlar Certified</span>
          )}
        </div>
      );
    }
    return null;
  };

  if (accountLoading.isLoading) {
    return (
      <div className="admin-container">
        <Loader text="Loading account data..." />
      </div>
    );
  }

  if (!accountLoading.isLoading && !account) {
    return (
      <div className="admin-container">
        <div className="error-state">
          <h2>Account not found</h2>
          <button className="btn-secondary" onClick={() => router.push("/admin")}>
            Back to overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <div className="account-info">
            <h1>Edit Account</h1>
            <div className="account-details">
              <p className="account-name">{account.name}</p>
              <p className="account-email">{account.email}</p>
              <span className={`role-badge ${account.role}`}>
                {getRoleDisplayName(account.role)}
              </span>
              {getAccountStatusBadge()}
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn-danger" 
              onClick={handleResetPassword}
              disabled={resetPasswordLoading.isLoading}
            >
              {resetPasswordLoading.isLoading ? "Resetting..." : "Reset Password"}
            </button>
            <button className="btn-secondary" onClick={() => router.push("/admin")}>
              Back to Overview
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        {formData.role === "company" && (
          <button 
            className={`tab ${activeTab === "company" ? "active" : ""}`}
            onClick={() => setActiveTab("company")}
          >
            Company Data
          </button>
        )}
        <button 
          className={`tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          Security & Role
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {activeTab === "profile" && (
          <div className="tab-content">
            <h2>Profile Information</h2>
            
            <div className="form-row">
              <div className="form-field">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="disabled-field"
              />
              <small className="field-hint">
                Email addresses cannot be changed for security reasons
              </small>
            </div>
          </div>
        )}

        {activeTab === "company" && formData.role === "company" && (
          <div className="tab-content">
            <h2>Company Data</h2>

            {!companyData && (
              <div className="info-notice">
                <strong>Note:</strong> This company has not yet created a profile. 
                You can manage the company profile here.
              </div>
            )}

            <div className="form-row">
              <div className="form-field">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={companyFormData.companyName}
                  onChange={handleCompanyInputChange}
                />
              </div>

              <div className="form-field">
                <label>Tax ID</label>
                <input
                  type="text"
                  name="taxId"
                  value={companyFormData.taxId}
                  onChange={handleCompanyInputChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Address</h3>
              <div className="address-grid">
                <div className="form-field">
                  <label>Street</label>
                  <input
                    type="text"
                    name="address.street"
                    value={companyFormData.address.street}
                    onChange={handleCompanyInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={companyFormData.address.city}
                    onChange={handleCompanyInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="address.postalCode"
                    value={companyFormData.address.postalCode}
                    onChange={handleCompanyInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={companyFormData.address.country}
                    onChange={handleCompanyInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                name="description"
                value={companyFormData.description}
                onChange={handleCompanyInputChange}
                rows="4"
              />
            </div>

            <div className="form-section">
              <h3>Service Areas</h3>
              <div className="service-areas">
                {serviceAreas.map((area) => (
                  <div key={area._id} className="service-area-item">
                    <span>{area.from} → {area.to}</span>
                    <button
                      type="button"
                      className="btn-small btn-danger"
                      onClick={() => removeServiceArea(area._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="service-area-form">
                  <input
                    type="text"
                    placeholder="From"
                    value={newServiceArea.from}
                    onChange={(e) =>
                      setNewServiceArea((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="To"
                    value={newServiceArea.to}
                    onChange={(e) =>
                      setNewServiceArea((prev) => ({
                        ...prev,
                        to: e.target.value,
                      }))
                    }
                  />
                  <button type="button" className="btn-small" onClick={addServiceArea}>
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="checkbox-group">
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  id="isVerified"
                  name="isVerified"
                  checked={companyFormData.isVerified}
                  onChange={handleCompanyInputChange}
                />
                <label htmlFor="isVerified">Verified Company</label>
              </div>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  id="isKisteKlarCertified"
                  name="isKisteKlarCertified"
                  checked={companyFormData.isKisteKlarCertified}
                  onChange={handleCompanyInputChange}
                />
                <label htmlFor="isKisteKlarCertified">KisteKlar Certified</label>
              </div>
            </div>

            {companyData && (
              <div className="company-stats">
                <h3>Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Average Rating</span>
                    <span className="stat-value">{companyData.averageRating || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Number of Reviews</span>
                    <span className="stat-value">{companyData.reviewsCount || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="tab-content">
            <h2>Security & Role</h2>
            
            <div className="form-field">
              <label>Account Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">Customer</option>
                <option value="company">Company</option>
                <option value="admin">Administrator</option>
              </select>
              <small className="field-hint">
                Warning: Changing the role may affect available features
              </small>
            </div>

            <div className="security-actions">
              <div className="security-item">
                <div>
                  <h4>Reset Password</h4>
                  <p>Generates a temporary password for the user</p>
                </div>
                <button 
                  type="button"
                  className="btn-danger"
                  onClick={handleResetPassword}
                  disabled={resetPasswordLoading.isLoading}
                >
                  {resetPasswordLoading.isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push("/admin")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saveLoading.isLoading}
          >
            {saveLoading.isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}