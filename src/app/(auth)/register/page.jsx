"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const RegisterPage = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "test-user",
    email: "test-user@test.com",
    phone: "+49 30 12345678",
    password: "123456",
    confirmPassword: "123456",
    role: "user",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  // Update default values when role changes
  useEffect(() => {
    if (formData.role === "user") {
      setFormData((prev) => ({
        ...prev,
        name: "test-user",
        email: "test-user@test.com",
      }));
    } else if (formData.role === "company") {
      setFormData((prev) => ({
        ...prev,
        name: "test-company",
        email: "test-company@test.com",
      }));
    }
  }, [formData.role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validateForm = () => {
    return true; // No validation needed since we have defaults
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Apply default values for empty fields before submitting
    const submissionData = { ...formData };

    if (!submissionData.name || submissionData.name.trim() === "") {
      submissionData.name =
        formData.role === "user" ? "test-user" : "test-company";
    }
    if (!submissionData.email || submissionData.email.trim() === "") {
      submissionData.email =
        formData.role === "user" ? "test-user@test.com" : "test-company@test.com";
    }
    if (!submissionData.phone || submissionData.phone.trim() === "") {
      submissionData.phone = "+49 30 12345678";
    }
    if (!submissionData.password || submissionData.password.trim() === "") {
      submissionData.password = "123456";
    }
    if (
      !submissionData.confirmPassword ||
      submissionData.confirmPassword.trim() === ""
    ) {
      submissionData.confirmPassword = "123456";
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setRegisterError(null);

    const { confirmPassword, terms, ...registrationData } = submissionData;

    try {
      const result = await register(registrationData);
      if (result.success) {
        router.push(
          submissionData.role === "user" ? "/account" : "/company/profile"
        );
      } else {
        setRegisterError(result.message || "Registration failed");
        setIsSubmitting(false);
      }
    } catch (error) {
      setRegisterError("An error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>Create Account</h1>
      <p>Sign up to use Pack & Go for your next move.</p>

      {registerError && <p className="error">{registerError}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="role">
            Account Type
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="user">Customer</option>
              <option value="company">Moving Company</option>
            </select>
          </label>
        </div>

        <div className="form-field">
          <label htmlFor="name">
            Full Name
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={formData.name}
              disabled={isSubmitting}
            />
          </label>
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="email">
            Email Address
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={formData.email}
              disabled={isSubmitting}
            />
          </label>
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="phone">
            Phone Number
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+49 30 12345678"
              disabled={isSubmitting}
            />
          </label>
          {errors.phone && <p className="error">{errors.phone}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="password">
            Password
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="123456"
              disabled={isSubmitting}
            />
          </label>
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword">
            Confirm Password
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="123456"
              disabled={isSubmitting}
            />
          </label>
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="checkbox-field">
          <label htmlFor="terms">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </label>
          {errors.terms && <p className="error">{errors.terms}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
