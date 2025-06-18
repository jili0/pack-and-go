"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  formData,
  handleChange,
  errors,
  isSubmitting,
}) => (
  <div className="form-field">
    <label htmlFor={name}>
      {label}
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={isSubmitting}
      />
    </label>
    {errors[name] && <p className="error">{errors[name]}</p>}
  </div>
);

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

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

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

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Create Account</h1>
        <p>Sign up to use Pack & Go for your next move.</p>

        {registerError && (
          <div className="error-alert">
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
            <span>{registerError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <InputField
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            isSubmitting={isSubmitting}
            label="Full Name"
            name="name"
            placeholder="First and Last Name"
          />

          <InputField
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            isSubmitting={isSubmitting}
            label="Email Address"
            name="email"
            type="email"
            placeholder="example@email.com"
          />

          <InputField
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            isSubmitting={isSubmitting}
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+1 123 456 7890"
          />

          <InputField
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            isSubmitting={isSubmitting}
            label="Password"
            name="password"
            type="password"
            placeholder="Minimum 6 characters"
          />

          <InputField
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            isSubmitting={isSubmitting}
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat password"
          />

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
              &nbsp; I agree to the <Link href="/terms">Terms of Service</Link>{" "}
              and <Link href="/privacy">Privacy Policy</Link>.
            </label>
            {errors.terms && <p className="error">{errors.terms}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="login-link">
          <p>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;