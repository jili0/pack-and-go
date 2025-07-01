"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const AdminLoginPage = () => {
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
    <div className="container">
      <h1>Admin Login</h1>
      <p>
        Please sign in with your administrator credentials to access the admin
        dashboard.
      </p>

      {loginError && <div className="error">{loginError}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="admin@pack-and-go.com"
          disabled={isSubmitting}
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <input
          type="password"
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

        <Link href="/">
          <button className="btn-primary">Back to Homepage</button>
        </Link>
      </form>
    </div>
  );
};

export default AdminLoginPage;
