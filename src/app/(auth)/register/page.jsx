"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import "@/app/styles/styles.css";

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
        router.push(formData.role === "user" ? "/user" : "/company/setup");
      } else {
        setRegisterError(result.message || "Registration failed");
        setIsSubmitting(false);
      }
    } catch (error) {
      setRegisterError("An error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  const FormField = ({ label, name, type = "text", placeholder, options }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          disabled={isSubmitting}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={isSubmitting}
        />
      )}
      {errors[name] && <p className="error">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="form-container">
      <h1>Create Account</h1>
      <p>Sign up to use Pack & Go for your next move.</p>

      {registerError && (
        <div>
          <div className="error-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p className="error">{registerError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        <FormField
          label="Full Name"
          name="name"
          placeholder="First and Last Name"
        />
        <FormField
          label="Email Address"
          name="email"
          type="email"
          placeholder="example@email.com"
        />
        <FormField
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="+1 123 456 7890"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Minimum 6 characters"
        />
        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat password"
        />
        <FormField
          label="Account Type"
          name="role"
          type="select"
          options={[
            { value: "user", label: "Customer" },
            { value: "company", label: "Moving Company" },
          ]}
        />

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
            I agree to the&nbsp;
            <Link href="/terms" target="_blank">
              Terms of Service
            </Link>
            &nbsp; and&nbsp;
            <Link href="/privacy" target="_blank">
              Privacy Policy
            </Link>
            .
          </label>
          {errors.terms && <p className="error-message">{errors.terms}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="form-footer">
        <p>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
