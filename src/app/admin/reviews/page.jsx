"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/ui/Loader";

export default function AdminReviewsPage() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && (!account || account.role !== "admin")) {
      router.push("/login");
    } else if (account) {
      fetchReviews();
    }
  }, [account, authLoading]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reviews");
      const result = await response.json();
      if (result.success) {
        setReviews(result.reviews);
      } else {
        setError(result.message || "Failed to load reviews");
      }
    } catch (err) {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert(result.message || "Failed to delete review");
      }
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (authLoading || loading) {
    return <Loader text="Loading reviews..." />;
  }

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <button onClick={fetchReviews}>Retry</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Review Moderation</h1>
      <p>Here you can manage all reviews posted by users</p>

      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <strong>
                  {review.accountId?.name || "Unknown User"} →{" "}
                  {review.companyId?.companyName || "Unknown Company"}
                </strong>
                <span className="rating">{review.rating} ★</span>
              </div>
              <p className="comment">"{review.comment}"</p>
              <small className="date">{formatDate(review.createdAt)}</small>
              <div className="actions">
                <button
                  onClick={() => deleteReview(review._id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
