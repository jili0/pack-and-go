"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    role: "user",
    newPassword: "", // Add this
    confirmPassword: "", // Add this
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // SVG Icons for password visibility
  const EyeOpenIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  const EyeClosedIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m1 1 22 22" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6.71 6.71a13.94 13.94 0 0 0-4.7 5.29s4 8 11 8a13.94 13.94 0 0 0 5.29-1.71"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="m14 14a3 3 0 0 1-4-4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ); // Add this

  // Company form data state
  const [companyFormData, setCompanyFormData] = useState({
    companyName: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
    taxId: "",
    description: "",
    hourlyRate: 0,
    isVerified: false,
    isKisteKlarCertified: false,
  });

  // Service areas state
  const [serviceAreas, setServiceAreas] = useState([]);
  const [newServiceArea, setNewServiceArea] = useState({ from: "", to: "" });

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
        throw new Error("Failed to fetch user data");
      }
      const responseData = await userResponse.json();

      // Extract user data from API response
      const userData = responseData.user || responseData;
      const companyDetails = responseData.companyDetails;

      setUser(userData);

      // Set basic user form data with existing values - PRESERVE password fields
      setFormData((prev) => ({
        ...prev, // Keep existing values including newPassword and confirmPassword
        email: userData.email || "",
        name: userData.name || "",
        phone: userData.phone || "",
        role: userData.role || "user",
      }));

      // If user is a company and we have company details
      if (userData.role === "company") {
        if (companyDetails) {
          // Use company details from the user API response
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
        } else {
          // Fallback: fetch company data separately if not included
          try {
            const companyResponse = await fetch(
              `/api/admin/companies/by-user/${userId}`
            );
            if (companyResponse.ok) {
              const companyData = await companyResponse.json();
              setCompanyData(companyData);

              setCompanyFormData({
                companyName: companyData.companyName || "",
                address: {
                  street: companyData.address?.street || "",
                  city: companyData.address?.city || "",
                  postalCode: companyData.address?.postalCode || "",
                  country: companyData.address?.country || "",
                },
                taxId: companyData.taxId || "",
                description: companyData.description || "",
                hourlyRate: companyData.hourlyRate || 0,
                isVerified: companyData.isVerified || false,
                isKisteKlarCertified: companyData.isKisteKlarCertified || false,
              });

              setServiceAreas(companyData.serviceAreas || []);
            }
          } catch (companyErr) {
            console.log("Could not fetch company data:", companyErr.message);
          }
        }
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
      [name]: type === "checkbox" ? checked : value || "", // Ensure value is never undefined
    }));
  };

  const handleCompanyInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setCompanyFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
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
        `/api/admin/users/${userId}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(
          `Password reset successfully! Temporary password: ${data.tempPassword} (for ${data.userEmail})`
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
      // Validate new password if provided
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

      // Update user basic info first
      const userResponse = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateProfile",
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (!userResponse.ok) {
        throw new Error("Failed to update user profile");
      }

      // Update password if provided
      if (formData.newPassword && formData.newPassword.trim() !== "") {
        const passwordResponse = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "changePassword",
            newPassword: formData.newPassword,
          }),
        });

        if (!passwordResponse.ok) {
          throw new Error("Failed to update password");
        }
      }

      // Update role if it changed
      if (formData.role !== user.role) {
        const roleResponse = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "changeRole",
            role: formData.role,
          }),
        });

        if (!roleResponse.ok) {
          throw new Error("Failed to update user role");
        }
      }

      // If company, update company data
      if (formData.role === "company" && companyData) {
        const companyUpdateData = {
          ...companyFormData,
          serviceAreas: serviceAreas,
        };

        const companyResponse = await fetch(
          `/api/admin/companies/${companyData._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(companyUpdateData),
          }
        );

        if (!companyResponse.ok) {
          throw new Error("Failed to update company data");
        }
      }

      let successMessage = "User data updated successfully";

      // Add specific success messages
      if (formData.newPassword && formData.newPassword.trim() !== "") {
        successMessage += " (including password change)";
        // Clear the password fields after successful update
        setFormData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
      }

      setSuccess(successMessage);

      // Refresh data to show updated info
      await fetchUserData();
    } catch (err) {
      setError("Failed to update user: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div>Loading user data...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <div>User not found</div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <h1>Edit User</h1>
          {user && (
            <p>
              Editing: {user.name} ({user.email}) - {user.role}
            </p>
          )}
        </div>
        <button onClick={() => router.push("/admin")}>← Back to Users</button>
      </div>

      {error && <div>{error}</div>}
      {success && <div>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic User Information */}
        <div>
          <h2>Basic Information</h2>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled
              title="Email cannot be changed for security reasons"
            />
          </div>

          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div>
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

          {/* Password Reset */}
          <div>
            <label>Current Password</label>
            <div>
              <input type="password" value="••••••••••••" disabled />
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={saving}
              >
                Reset Password
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label>New Password (Optional)</label>
            <div>
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
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>
            <small>
              Leave empty to keep current password. Minimum 6 characters.
            </small>
          </div>

          {/* Confirm Password Field */}
          {formData.newPassword && formData.newPassword.trim() !== "" && (
            <div>
              <label>Confirm New Password</label>
              <div>
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
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
              {formData.confirmPassword &&
                formData.newPassword !== formData.confirmPassword && (
                  <small>Passwords do not match</small>
                )}
            </div>
          )}
        </div>

        {/* User Statistics (for regular users) */}
        {user.role === "user" && (
          <div>
            <h2>User Statistics</h2>
            <div>
              <div>
                <span>Reviews:</span>
                <span>{user.reviews?.length || 0}</span>
              </div>
              <div>
                <span>Orders:</span>
                <span>{user.orders?.length || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Company Information (only for company accounts) */}
        {formData.role === "company" && companyData && (
          <div>
            <h2>Company Information</h2>

            <div>
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={companyFormData.companyName}
                onChange={handleCompanyInputChange}
              />
            </div>

            <div>
              <div>
                <label>Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={companyFormData.address.street}
                  onChange={handleCompanyInputChange}
                />
              </div>
              <div>
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={companyFormData.address.city}
                  onChange={handleCompanyInputChange}
                />
              </div>
              <div>
                <label>Postal Code</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={companyFormData.address.postalCode}
                  onChange={handleCompanyInputChange}
                />
              </div>
              <div>
                <label>Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={companyFormData.address.country}
                  onChange={handleCompanyInputChange}
                />
              </div>
            </div>

            <div>
              <label>Tax ID</label>
              <input
                type="text"
                name="taxId"
                value={companyFormData.taxId}
                onChange={handleCompanyInputChange}
              />
            </div>

            <div>
              <label>Hourly Rate (€)</label>
              <input
                type="number"
                name="hourlyRate"
                value={companyFormData.hourlyRate}
                onChange={handleCompanyInputChange}
                min="0"
              />
            </div>

            <div>
              <label>Description</label>
              <textarea
                name="description"
                value={companyFormData.description}
                onChange={handleCompanyInputChange}
                rows="4"
              />
            </div>

            {/* Service Areas */}
            <div>
              <label>Service Areas</label>
              <div>
                {serviceAreas.map((area) => (
                  <div key={area._id}>
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
                <div>
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
            <div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={companyFormData.isVerified}
                    onChange={handleCompanyInputChange}
                  />
                  Verified Company
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="isKisteKlarCertified"
                    checked={companyFormData.isKisteKlarCertified}
                    onChange={handleCompanyInputChange}
                  />
                  KisteKlar Certified
                </label>
              </div>
            </div>

            {/* Company Statistics */}
            <div>
              <div>
                <span>Average Rating:</span>
                <span>{companyData.averageRating || 0}</span>
              </div>
              <div>
                <span>Reviews Count:</span>
                <span>{companyData.reviewsCount || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div>
          <button type="button" onClick={() => router.push("/admin")}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
