"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const OrderDetails = ({ orderId }) => {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (data.success) {
          setOrder(data.order);
          setCompany(data.company);
        } else {
          setError(data.message || "Failed to load order details.");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return "No date specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "Request Sent",
      confirmed: "Confirmed",
      declined: "Declined",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const handleCancelOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setShowCancelModal(false);
      } else {
        setError(data.message || "Failed to cancel order.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderDetailRow = (label, value) => (
    <div className="order-detail">
      <strong>{label}:</strong> {value}
    </div>
  );

  if (loading)
    return (
      <div className="container">
        <p>Loading order details...</p>
      </div>
    );

  if (error)
    return (
      <div className="container">
        <h3 className="error">Error</h3>
        <p>{error}</p>
        <button
          className="btn-primary"
          onClick={() => router.push("/account/orders")}
        >
          Back to Orders
        </button>
      </div>
    );

  if (!order || !company)
    return (
      <div className="container">
        <h3>Order Not Found</h3>
        <p>The requested order could not be found.</p>
        <button
          className="btn-primary"
          onClick={() => router.push("/account/orders")}
        >
          Back to Orders
        </button>
      </div>
    );

  return (
    <div className="container">
      <div className="order-details-card">
        <h2>Order Details</h2>

        {renderDetailRow("Order ID", order._id)}
        {renderDetailRow("Order Date", formatDate(order.createdAt))}
        {renderDetailRow("Status", getStatusBadge(order.status))}

        {renderDetailRow(
          "Moving Company",
          <p>
            {company.companyName} •{" "}
            {[...Array(5)].map((_, i) => (
              <span key={i}>★</span>
            ))}{" "}
            ({company.reviewsCount}{" "}
            {company.reviewsCount === 1 ? "review" : "reviews"}){" "}
            {company.isKisteKlarCertified && "• KisteKlar Certified"}
          </p>
        )}

        {renderDetailRow(
          "From",
          `${order.fromAddress.street}, ${order.fromAddress.postalCode} ${order.fromAddress.city}, ${order.fromAddress.country}`
        )}
        {renderDetailRow(
          "To",
          `${order.toAddress.street}, ${order.toAddress.postalCode} ${order.toAddress.city}, ${order.toAddress.country}`
        )}
        {renderDetailRow(
          "Moving Date",
          order.confirmedDate ? (
            formatDate(order.confirmedDate)
          ) : (
            <span>
              Preferred: {formatDate(order.preferredDates[0])}{" "}
              <small>(Waiting for confirmation)</small>
            </span>
          )
        )}
        {renderDetailRow("Helpers", order.helpersCount)}
        {renderDetailRow("Estimated Hours", order.estimatedHours)}
        {renderDetailRow("Total Price", `${order.totalPrice} €`)}

        {order.notes && renderDetailRow("Additional Notes", order.notes)}
      </div>

      <div className="form-footer">
        <button className="btn-primary" onClick={() => router.back()}>
          Back
        </button>
        {order.status === "pending" && (
          <button
            className="btn-primary"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Order
          </button>
        )}
        {order.status === "completed" && !order.review && (
          <button
            className="btn-primary"
            onClick={() => router.push(`/account/orders/${orderId}/review`)}
          >
            Leave Review
          </button>
        )}
      </div>

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel this order?</p>
            <p>This action cannot be undone.</p>
            <div className="form-footer">
              <button
                className="btn-primary"
                onClick={() => setShowCancelModal(false)}
              >
                No
              </button>
              <button
                className="btn-primary"
                onClick={handleCancelOrder}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
