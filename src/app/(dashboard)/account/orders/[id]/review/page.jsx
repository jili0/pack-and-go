"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { account, initialCheckDone } = useAuth(); // ✅ initialCheckDone hinzugefügt
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialCheckDone) return; // ✅ Warten auf Auth-Check
    if (!account) {
      router.push("/login");
      return;
    }
    if (orderId) fetchOrder();
  }, [orderId, account, initialCheckDone]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
          if (data.order.status !== "completed" || data.order.review) {
            router.push("/account/orders");
            return;
          }
        } else {
          setError(data.message || "Order not found");
        }
      } else {
        setError("Order not found");
      }
    } catch (err) {
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) return setError("Please select a rating");
    if (!comment.trim()) return setError("Please provide a comment");
    if (comment.length > 500)
      return setError("Comment cannot exceed 500 characters");

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId,
          companyId: order.companyId,
          rating: rating,
          comment: comment.trim(),
        }),
      });

      if (response.ok) {
        alert("Review submitted successfully!");
        router.push("/account");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to submit review");
      }
    } catch (err) {
      setError("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialCheckDone || loading) {
    return (
      <div className="container">
        <div className="loader-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container">
        <h1>Order Not Found</h1>
        <button onClick={() => router.push("/account")} className="btn-primary">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <form className="container review-form">
      <h1>Review Your Order</h1>

      <p>
        <strong>Order ID: </strong>
        {order._id}
      </p>
      <p>
        <strong>Company: </strong>
        {order.companyName}
      </p>
      <p>
        <strong>Date: </strong>
        {new Date(order.createdAt).toLocaleDateString()}
      </p>
      <p>
        <strong>Select a rating: </strong>
        <span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={star <= rating ? "star-active" : "star-inactive"}
            >
              ★
            </button>
          ))}
        </span>
      </p>

      <p>
        <strong>
          <label>Comment </label>&nbsp;
        </strong>
        <span>({comment.length}/500)</span>:
      </p>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={500}
        placeholder="Share your experience with this order..."
      />

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="btn-primary"
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/account")}
          className="btn-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}