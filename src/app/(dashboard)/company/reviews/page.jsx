"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CompanyReviewsPage() {
  const router = useRouter();
  const { account, initialCheckDone } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialCheckDone) return;

    if (!account) {
      router.push("/login");
      return;
    }

    if (account.role !== "company") {
      router.push("/");
      return;
    }

    fetchCompanyReviews();
  }, [initialCheckDone, account]);

  const fetchCompanyReviews = async () => {
    try {
      // 1. Lade aktuelle Firma (basierend auf eingeloggt)
      const companyRes = await fetch("/api/company/me");
      const companyData = await companyRes.json();

      if (!companyData.success || !companyData.company?._id) {
        setError("Company not found");
        return;
      }

      const companyId = companyData.company._id;

      // 2. Lade Reviews für diese Firma
      const res = await fetch(`/api/reviews?companyId=${companyId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setReviews(data.reviews);
      } else {
        setError(data.message || "Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Server error while loading reviews");
    } finally {
      setLoading(false);
    }
  };

  if (!initialCheckDone || loading) {
    return <p className="container">Loading reviews...</p>;
  }

  if (error) {
    return (
      <div className="container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="container">
        <h2>No reviews yet</h2>
        <p>Customers have not submitted any reviews for your company yet.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your Reviews</h1>
      {reviews.map((review) => (
        <div key={review._id} className="review-card">
          <p>
            <strong>Rating:</strong> {review.rating} / 5
          </p>
          <p>
            <strong>Comment:</strong> {review.comment}
          </p>
          <p>
            <strong>Customer:</strong> {review.accountId?.name || "Anonymous"}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
          <hr />
        </div>
      ))}
    </div>
  );
}
