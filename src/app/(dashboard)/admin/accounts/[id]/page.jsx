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
  const [user, setUser] = useState(null);
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
    hourlyRate: 0,
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
      const userResponse = await fetch(`/api/admin/users/${accountId}`);

      if (!userResponse.ok) throw new Error("Failed to fetch user data");

      const responseData = await userResponse.json();
      const userData = responseData.user || responseData;
      const companyDetails = responseData.companyDetails;

      setUser(userData);

      // Set basic user form data
      setFormData((prev) => ({
        ...prev,
        email: userData.email || "",
        name: userData.name || "",
        phone: userData.phone || "",
        role: userData.role || "user",
      }));

      // Handle company data if user is a company
      if (userData.role === "company" && companyDetails) {
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
          hourlyRate: companyDetails.hourlyRate || 0,
          isVerified: companyDetails.isVerified || false,
          isKisteKlarCertified: companyDetails.isKisteKlarCertified || false,
        });
        setServiceAreas(companyDetails.serviceAreas || []);
      }
    } catch (err) {
      setError("Failed to load user data: " + err.message);
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
          `Password reset! Temp password: ${data.tempPassword} (for ${data.userEmail})`
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

      // Update user profile
      const userResponse = await fetch(`/api/admin/users/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProfile",
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (!userResponse.ok) throw new Error("Failed to update user profile");

      // Update password if provided
      if (formData.newPassword && formData.newPassword.trim() !== "") {
        const passwordResponse = await fetch(`/api/admin/users/$accountrId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "changePassword",
            newPassword: formData.newPassword,
          }),
        });

        if (!passwordResponse.ok) throw new Error("Failed to update password");
      }

      // Update role if changed
      if (formData.role !== user.role) {
        const roleResponse = await fetch(`/api/admin/users/$accountrId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "changeRole",
            role: formData.role,
          }),
        });

        if (!roleResponse.ok) throw new Error("Failed to update user role");
      }

      // Update company data if applicable
      if (formData.role === "company" && companyData) {
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
      }

      let successMessage = "User data updated successfully";
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
      setError("Failed to update user: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="container">
        <p>Loading user data...</p>
      </div>
    );
  if (!loading && !user)
    return (
      <div className="container">
        <p>User not found</p>
      </div>
    );

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Edit User</h1>
          <p>
            Editing: {user.name} ({user.email}) - {user.role}
          </p>
        </div>
        <button className="btn-primary" onClick={() => router.push("/admin")}>
          ← Back to Users
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <section>
          <h2>Basic Information</h2>

          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              title="Email cannot be changed for security reasons"
            />
          </div>

          <div className="form-field">
            <label>Name</label>
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

          <div className="form-field">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="user">User</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password Section */}
          <div className="form-field">
            <label>Current Password</label>
            <div className="password-field">
              <input type="password" value="••••••••••••" disabled />
              <button
                type="button"
                className="btn-primary"
                onClick={handleResetPassword}
                disabled={saving}
              >
                Reset Password
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>New Password (Optional)</label>
            <div className="password-field">
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
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              ></button>
            </div>
            <small>
              Leave empty to keep current password. Minimum 6 characters.
            </small>
          </div>

          {formData.newPassword && formData.newPassword.trim() !== "" && (
            <div className="form-field">
              <label>Confirm New Password</label>
              <div className="password-field">
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
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                ></button>
              </div>
              {formData.confirmPassword &&
                formData.newPassword !== formData.confirmPassword && (
                  <small className="error">Passwords do not match</small>
                )}
            </div>
          )}
        </section>

        {/* User Statistics */}
        {user.role === "user" && (
          <section>
            <h2>User Statistics</h2>
            <div className="stats-grid">
              <div>Reviews: {user.reviews?.length || 0}</div>
              <div>Orders: {user.orders?.length || 0}</div>
            </div>
          </section>
        )}

        {/* Company Information */}
        {formData.role === "company" && companyData && (
          <section>
            <h2>Company Information</h2>

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
              <label>Hourly Rate (€)</label>
              <input
                type="number"
                name="hourlyRate"
                value={companyFormData.hourlyRate}
                onChange={handleCompanyInputChange}
                min="0"
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

            {/* Company Statistics */}
            <div className="stats-grid">
              <div>Average Rating: {companyData.averageRating || 0}</div>
              <div>Reviews Count: {companyData.reviewsCount || 0}</div>
            </div>
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
