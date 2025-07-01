"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { account, checkLoading } = useAuth();
  const orderLoading = useLoading('api', 'reviewOrder');
  const submitLoading = useLoading('api', 'submitReview');
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (checkLoading) return;
    if (!account) {
      router.push("/login");
      return;
    }
    if (orderId) fetchOrder();
  }, [orderId, account, checkLoading]);

  const fetchOrder = async () => {
    orderLoading.startLoading();
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
      orderLoading.stopLoading();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) return setError("Please select a rating");
    if (!comment.trim()) return setError("Please provide a comment");
    if (comment.length > 500)
      return setError("Comment cannot exceed 500 characters");

    submitLoading.startLoading();
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
      submitLoading.stopLoading();
    }
  };

  if (checkLoading || orderLoading.isLoading) {
    return (
      <div className="container">
        <Loader text="Loading..." />
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

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

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
          disabled={submitLoading.isLoading || rating === 0}
          className="btn-primary"
          onClick={handleSubmit}
        >
          {submitLoading.isLoading ? "Submitting..." : "Submit Review"}
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