"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthForm } from "@/app/(auth)/login/page";

const AdminLoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  const handleAdminLogin = async (formData, setAuthError, setIsSubmitting) => {
    const result = await login(formData.email, formData.password);
    if (result.success) {
      if (result.account.role === "admin") {
        router.push("/admin");
      } else {
        setAuthError("Access denied. Admin credentials required.");
        setIsSubmitting(false);
      }
    } else {
      setAuthError(result.message || "Login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Admin Login"
      subtitle="Please sign in with your administrator credentials to access the admin dashboard."
      emailPlaceholder="admin@pack-and-go.com"
      passwordPlaceholder="Your admin password"
      submitText="Access Admin Dashboard"
      submitLoadingText="Signing in..."
      secondaryButtonText="Back to Homepage"
      secondaryButtonHref="/"
      onSubmit={handleAdminLogin}
      adminMode={true}
    />
  );
};

export default AdminLoginPage;
