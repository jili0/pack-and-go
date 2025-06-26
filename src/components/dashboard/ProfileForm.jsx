"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";

const ProfileForm = () => {
  const { account, loading: authLoading } = useAuth();
  const updateLoading = useLoading('api', 'updateProfile');
  const deleteLoading = useLoading('api', 'deleteProfile');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordType, setPasswordType] = useState("password");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (account) {
      setValue("name", account.name || "");
      setValue("email", account.email || "");
      setValue("phone", account.phone || "");
    }
  }, [account, setValue]);

  const onSubmit = async (data) => {
    updateLoading.startLoading();
    setSuccess(false);
    setError(null);

    try {
      const payload = {
        name: data.name,
        phone: data.phone,
      };

      if (data.currentPassword) {
        if (data.newPassword !== data.confirmPassword) {
          setError("New passwords do not match");
          updateLoading.stopLoading();
          return;
        }

        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);

        setValue("currentPassword", "");
        setValue("newPassword", "");
        setValue("confirmPassword", "");
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      updateLoading.stopLoading();
    }
  };

  const handleDeleteAccount = async () => {
    deleteLoading.startLoading();

    try {
      const response = await fetch("/api/auth/delete", {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Redirect will happen automatically due to auth context
      } else {
        setError(result.message || "Failed to delete account");
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("An error occurred. Please try again later.");
      setShowDeleteModal(false);
    } finally {
      deleteLoading.stopLoading();
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  if (authLoading) {
    return (
      <div>
        <Loader text="Loading profile data..." />
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <h2>My Profile</h2>
        </div>

        <div>
          {success && <div>Your profile has been updated successfully.</div>}

          {error && <div>{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <h3>Personal Information</h3>

              <div>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <span>{errors.name.message}</span>}
              </div>

              <div>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  disabled
                  {...register("email")}
                />
                <small>Email address cannot be changed</small>
              </div>

              <div>
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^\+?[0-9\s\-()]{8,}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                />
                {errors.phone && <span>{errors.phone.message}</span>}
              </div>
            </div>

            <div>
              <h3>Change Password</h3>

              <div>
                <label htmlFor="currentPassword">Current Password</label>
                <div>
                  <input
                    id="currentPassword"
                    type={passwordType}
                    {...register("currentPassword", {
                      validate: (value) =>
                        (!value &&
                          !document.getElementById("newPassword").value) ||
                        value.length >= 6 ||
                        "Password must be at least 6 characters",
                    })}
                  />
                  <button type="button" onClick={togglePasswordVisibility}>
                    {passwordType === "password" ? "Show" : "Hide"}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span>{errors.currentPassword.message}</span>
                )}
                <small>
                  Leave blank if you don't want to change your password
                </small>
              </div>

              <div>
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type={passwordType}
                  {...register("newPassword", {
                    validate: (value) =>
                      (!value &&
                        !document.getElementById("currentPassword").value) ||
                      value.length >= 6 ||
                      "Password must be at least 6 characters",
                  })}
                />
                {errors.newPassword && (
                  <span>{errors.newPassword.message}</span>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type={passwordType}
                  {...register("confirmPassword", {
                    validate: (value) =>
                      (!value &&
                        !document.getElementById("currentPassword").value) ||
                      value === document.getElementById("newPassword").value ||
                      "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <span>{errors.confirmPassword.message}</span>
                )}
              </div>
            </div>

            <div>
              <button type="submit" disabled={updateLoading.isLoading}>
                {updateLoading.isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <div>
            <h3>Delete Account</h3>
            <p>
              Once you delete your account, there is no going back. All of your
              data will be permanently removed.
            </p>
            <button type="button" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div>
          <div>
            <div>
              <h3>Delete Account</h3>
            </div>
            <div>
              <p>Are you sure you want to delete your account?</p>
              <p>
                This action cannot be undone. All your data, including orders
                and reviews, will be permanently removed.
              </p>
            </div>
            <div>
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteLoading.isLoading}>
                {deleteLoading.isLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;