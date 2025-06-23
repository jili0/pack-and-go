"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import "@/app/styles/styles.css";

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    role: "user",
    newPassword: "",
    confirmPassword: "",
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
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/accounts/${accountId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch account data");
      }

      const data = await response.json();
      const accountData = data.account || data;
      const companyDetails = data.companyDetails;
      setAccount(accountData);

      setFormData((prev) => ({
        ...prev,
        email: accountData.email || "",
        name: accountData.name || "",
        phone: accountData.phone || "",
        role: accountData.role || "user",
      }));

      // Handle company data - always initialize companyFormData for company accounts
      if (accountData.role === "company") {
        if (companyDetails) {
          // Company profile exists - populate with existing data
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
          // No company profile exists - initialize with empty data
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
      setError("Failed to load account data: " + err.message);
    } finally {
      setLoading(false);
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
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/edit/${accountId}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to reset password");

      const data = await response.json();
      if (data.success) {
        setSuccess(
          `Password reset! Temp password: ${data.tempPassword} (for ${data.accountEmail})`
        );
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Failed to reset password: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // Validate password if provided
      if (formData.newPassword && formData.newPassword.trim() !== "") {
        if (formData.newPassword.length < 6) {
          setError("New password must be at least 6 characters long");
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New password and confirmation password do not match");
          return;
        }
      }

      // Update account profile
      const response = await fetch(`/api/admin/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProfile",
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (!response.ok) throw new Error("Failed to update account profile");

      // Update password if provided
      if (formData.newPassword && formData.newPassword.trim() !== "") {
        const passwordResponse = await fetch(
          `/api/admin/accounts/${accountId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "changePassword",
              newPassword: formData.newPassword,
            }),
          }
        );

        if (!passwordResponse.ok) throw new Error("Failed to update password");
      }

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

        if (!roleResponse.ok) throw new Error("Failed to update account role");
      }

      // Handle company data - create or update
      if (formData.role === "company") {
        if (companyData && companyData._id) {
          // Update existing company profile
          const companyResponse = await fetch(
            `/api/admin/companies/${companyData._id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...companyFormData, serviceAreas }),
            }
          );

          if (!companyResponse.ok)
            throw new Error("Failed to update company data");
        } else {
          // Create new company profile
          const companyResponse = await fetch(`/api/admin/companies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              ...companyFormData, 
              serviceAreas,
              accountId: accountId 
            }),
          });

          if (!companyResponse.ok)
            throw new Error("Failed to create company profile");
        }
      }

      let successMessage = "Account data updated successfully";

      if (formData.newPassword && formData.newPassword.trim() !== "") {
        successMessage += " (including password change)";
        setFormData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
      }

      setSuccess(successMessage);
      await fetchAccountData();
    } catch (err) {
      setError("Failed to update account: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading account data...</p>;

  if (!loading && !account) return <p>Account not found</p>;

  return (
    <div className="container">
      <div className="edit-header">
        <p>
          Editing {account.role} account: <b>{account.name} </b>({account.email}
          )
        </p>

        <button className="btn-secondary" onClick={() => router.push("/admin")}>
          Back to Accounts
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </label>
        </div>

        <div className="form-field">
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              title="Email cannot be changed for security reasons"
            />
          </label>
        </div>

        <div className="form-field">
          <label>
            Phone
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </label>
        </div>

        <div className="form-field">
          <label>
            Role
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="user">Account</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>

        <div className="form-field">
          <label>
            Current Password
            <input type="password" value="••••••••••••" disabled />
          </label>
        </div>
        <div className="form-field">
          <label>
            New Password (Optional)
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter new password to change it"
              minLength="6"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              Toggle
            </button>
          </label>
        </div>

        {formData.newPassword && formData.newPassword.trim() !== "" && (
          <div className="form-field">
            <label>
              Confirm New Password
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                minLength="6"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                Toggle
              </button>
            </label>

            {formData.confirmPassword &&
              formData.newPassword !== formData.confirmPassword && (
                <small className="error">Passwords do not match</small>
              )}
          </div>
        )}

        {/* Company Information - Show for all company accounts */}
        {formData.role === "company" && (
          <section>
            <h2>Company Information</h2>
            
            {/* Notice when no company profile exists */}
            {!companyData && (
              <div className="info-notice" style={{
                background: '#f0f8ff',
                border: '1px solid #b3d9ff',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '20px',
                color: '#0066cc'
              }}>
                <strong>Notice:</strong> This company account has not created a profile yet. 
                You can create and manage their company profile below.
              </div>
            )}

            <div className="form-field">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={companyFormData.companyName}
                onChange={handleCompanyInputChange}
              />
            </div>

            <div className="address-grid">
              <div className="form-field">
                <label>Street Address</label>
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

            <div className="form-field">
              <label>Tax ID</label>
              <input
                type="text"
                name="taxId"
                value={companyFormData.taxId}
                onChange={handleCompanyInputChange}
              />
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

            {/* Service Areas */}
            <div className="form-field">
              <label>Service Areas</label>
              <div className="service-areas">
                {serviceAreas.map((area) => (
                  <div key={area._id} className="service-area-item">
                    <span>
                      {area.from} → {area.to}
                    </span>
                    <button
                      type="button"
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
                  <button type="button" onClick={addServiceArea}>
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="checkbox-group">
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={companyFormData.isVerified}
                  onChange={handleCompanyInputChange}
                />
                <label>Verified Company</label>
              </div>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  name="isKisteKlarCertified"
                  checked={companyFormData.isKisteKlarCertified}
                  onChange={handleCompanyInputChange}
                />
                <label>KisteKlar Certified</label>
              </div>
            </div>

            {/* Company Statistics - only show if company profile exists */}
            {companyData && (
              <div className="stats-grid">
                <div>Average Rating: {companyData.averageRating || 0}</div>
                <div>Reviews Count: {companyData.reviewsCount || 0}</div>
              </div>
            )}
          </section>
        )}
        
        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push("/admin")}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}