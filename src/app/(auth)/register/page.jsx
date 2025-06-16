// src/app/(auth)/register/page.jsx
"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import "@/app/styles/styles.css"

// Component for the content of the register form
const RegisterContent = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default: regular user
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear errors when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.terms) {
      newErrors.terms = "You must agree to the Terms of Service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setRegisterError(null);

    // Remove password confirmation from data before sending
    const { confirmPassword, terms, ...registrationData } = formData;

    try {
      const result = await register(registrationData);

      if (result.success) {
        // Redirect to dashboard
        router.push(formData.role === "user" ? "/user" : "/company/setup");
      } else {
        setRegisterError(result.message || "Registration failed");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegisterError("An error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create Account</h1>
      <p>Sign up to use Pack & Go for your next move.</p>

      {registerError && (
        <div>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p>{registerError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="First and Last Name"
            disabled={isSubmitting}
          />
          {errors.name && <p>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            disabled={isSubmitting}
          />
          {errors.email && <p>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 123 456 7890"
            disabled={isSubmitting}
          />
          {errors.phone && <p>{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            disabled={isSubmitting}
          />
          {errors.password && <p>{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            disabled={isSubmitting}
          />
          {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
        </div>

        <div>
          <label htmlFor="role">Account Type</label>
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
        </div>

        <div>
          <input
            type="checkbox"
            id="terms"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <label htmlFor="terms">
            I agree to the{" "}
            <Link href="/terms" target="_blank">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        {errors.terms && <p>{errors.terms}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div>
        <p>
          Already have an account?
          <Link href="/login"> Sign in</Link>
        </p>
      </div>
    </div>
  );
};

// Simple fallback component
const RegisterSkeleton = () => (
  <div>
    <h1>Loading...</h1>
  </div>
);

// Main component with Suspense boundary
const RegisterPage = () => {
  return (
    <div>
      <Suspense fallback={<RegisterSkeleton />}>
        <RegisterContent />
      </Suspense>
    </div>
  );
};

export default RegisterPage;
