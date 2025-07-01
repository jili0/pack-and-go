"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/ui/Loader";

const AdminLoginContent = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoginError(null);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        if (result.account.role === "admin") {
          router.push("/admin");
        } else {
          setLoginError("Access denied. Admin credentials required.");
          setIsSubmitting(false);
        }
      } else {
        setLoginError(result.message || "Login failed");
        setIsSubmitting(false);
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Admin Login</h1>
      <p>
        Please sign in with your administrator credentials to access the admin
        dashboard.
      </p>

      {loginError && (
        <div className="error">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{loginError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className="no-visible">
          Admin Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="admin@pack-and-go.com"
          disabled={isSubmitting}
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <label htmlFor="password" className="no-visible">
          Admin Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Your admin password"
          disabled={isSubmitting}
        />
        {errors.password && <span className="error">{errors.password}</span>}

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Access Admin Dashboard"}
        </button>
      </form>

      <div className="form-footer">
        <Link href="/">Back to Homepage</Link>
        <p>
          This is a restricted area. Only authorized administrators can access
          this section.
        </p>
      </div>
    </div>
  );
};

const AdminLoginPage = () => {
  return (
    <div className="container">
      <Suspense fallback={<Loader text="Loading..." />}>
        <AdminLoginContent />
      </Suspense>
    </div>
  );
};

export default AdminLoginPage;
