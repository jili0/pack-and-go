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
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="container">
        <h1>No reviews yet</h1>
        <p>Customers have not submitted any reviews for your company yet.</p>
        <button className="btn-primary" onClick={() => router.back()}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your Reviews</h1>
      {reviews.map((review) => (
        <div key={review._id} className="review-card">
          <div className="review-header">
            <span>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= review.rating ? "star-active" : "star-inactive"}
                >
                  ★
                </span>
              ))}
            </span>
            <span>{review.accountId?.name || "Anonymous"}</span>
            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="review-comment">{review.comment}</div>
        </div>
      ))}
      <button className="btn-primary" onClick={() => router.back()}>
        Back to Dashboard
      </button>
    </div>
  );
}