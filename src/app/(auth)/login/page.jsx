"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/ui/Loader";
import "@/app/styles/styles.css";

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
    setLoginError(null);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        router.push(result.account.role === "user" ? "/account" : "/company");
      } else {
        setLoginError(result.message || "Login failed");
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      {loginError && <p>{loginError}</p>}

      <form onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p>Sign in to plan or manage your move.</p>
        <div>
          <label htmlFor="email" className="no-visible">
            Email Address
          </label>
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
          <label htmlFor="password" className="no-visible">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            disabled={isSubmitting}
          />
          {errors.password && <p>{errors.password}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="form-footer">
        <p>
          Don&apos;t have an account yet?
          <Link href="/register"> Register now</Link>
        </p>
      </div>
    </div>
  );
};

const LoginSkeleton = () => (
  <div className="container">
    <Loader text="Loading..." />
  </div>
);

const LoginPage = () => {
  return (
    <div className="container py-8">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginContent />
      </Suspense>
    </div>
  );
};

export default LoginPage;
