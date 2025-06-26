"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const RegisterPage = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email address is invalid";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.terms)
      newErrors.terms = "You must agree to the Terms of Service";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setRegisterError(null);

    const { confirmPassword, terms, ...registrationData } = formData;

    try {
      const result = await register(registrationData);
      if (result.success) {
        router.push(formData.role === "user" ? "/account" : "/company/setup");
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
          <label htmlFor="name">
            Full Name
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="First and Last Name"
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
              placeholder="example@email.com"
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
              placeholder="+1 123 456 7890"
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
              placeholder="Minimum 6 characters"
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
              placeholder="Repeat password"
              disabled={isSubmitting}
            />
          </label>
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}
        </div>

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
