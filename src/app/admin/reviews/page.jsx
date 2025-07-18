"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/ui/Loader";

export default function AdminReviewsPage() {
  const router = useRouter();
  const { account, loading: authLoading, initialCheckDone } = useAuth(); // NEU: initialCheckDone verwenden

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Warte bis der initiale Auth-Check fertig ist
    if (initialCheckDone) {
      if (!account) {
        router.push("/login");
      } else if (account.role !== "admin") {
        router.push("/"); // Oder eine "Access Denied" Seite
      } else {
        // Nur wenn alles OK ist, lade die Reviews
        fetchReviews();
      }
    }
  }, [account, initialCheckDone, router]); // initialCheckDone in dependencies

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reviews", {
        credentials: 'include'
      });
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
    if (!id) {
      alert("Invalid review ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      console.log("Deleting review with ID:", id);
      console.log("Current user:", account);
      
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Delete result:", result);
      
      if (result.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
        alert("Review deleted successfully!");
      } else {
        alert(result.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Failed to delete review: ${err.message}`);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Zeige Loading bis Auth-Check fertig ist
  if (!initialCheckDone || authLoading) {
    return <Loader text="Checking authentication..." />;
  }

  // Wenn nicht eingeloggt oder kein Admin, zeige nichts (Redirect läuft)
  if (!account || account.role !== "admin") {
    return <Loader text="Redirecting..." />;
  }

  // Zeige Loading für Reviews
  if (loading) {
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