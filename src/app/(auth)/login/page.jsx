"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export const AuthForm = ({
  title,
  subtitle,
  emailPlaceholder,
  passwordPlaceholder,
  submitText,
  submitLoadingText,
  secondaryButtonText,
  secondaryButtonHref,
  onSubmit,
  adminMode = false,
}) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);

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
    setAuthError(null);

    try {
      await onSubmit(formData, setAuthError, setIsSubmitting);
    } catch (error) {
      setAuthError("An error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>{title}</h1>
      <p>{subtitle}</p>

      {authError && <div className="error">{authError}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={emailPlaceholder}
          disabled={isSubmitting}
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={passwordPlaceholder}
          disabled={isSubmitting}
        />
        {errors.password && <span className="error">{errors.password}</span>}

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? submitLoadingText : submitText}
        </button>

        <Link href={secondaryButtonHref}>
          <button className="btn-primary">{secondaryButtonText}</button>
        </Link>
      </form>
    </div>
  );
};

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (formData, setAuthError, setIsSubmitting) => {
    const result = await login(formData.email, formData.password);
    if (result.success) {
      router.push(result.account.role === "user" ? "/account" : "/company");
    } else {
      setAuthError(result.message || "Login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Welcome Back"
      subtitle="Sign in to plan or manage your move."
      emailPlaceholder="example@email.com"
      passwordPlaceholder="Your password"
      submitText="Sign in"
      submitLoadingText="Signing in..."
      secondaryButtonText="Register now"
      secondaryButtonHref="/register"
      onSubmit={handleLogin}
    />
  );
};

export default LoginPage;
