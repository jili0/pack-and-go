"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";

export const OrderInfo = ({ order, company }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "No date specified";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="order-details-card">
      <div className="order-detail">
        <span>Order ID:</span>
        <span>{order._id}</span>
      </div>
      <div className="order-detail">
        <span>Order Status:</span>
        <span>Request Sent</span>
      </div>
      <div className="order-detail">
        <span>Moving Company:</span>
        <span>
          {company.companyName}&nbsp;
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={i < Math.round(company.averageRating) ? "yellow" : ""}
            >
              ★
            </span>
          ))}
          &nbsp;{company.reviewsCount}{" "}
          {company.reviewsCount === 1 ? "review" : "reviews"}
          &nbsp;
          {company.isKisteKlarCertified && (
            <span className="certified-badge">KisteKlar Certified</span>
          )}
        </span>
      </div>
      <div className="order-detail">
        <span>From:</span>
        <span>
          {order.fromAddress.street}, {order.fromAddress.postalCode}&nbsp;
          {order.fromAddress.city}
        </span>
      </div>
      <div className="order-detail">
        <span>To:</span>
        <span>
          {order.toAddress.street}, {order.toAddress.postalCode}&nbsp;
          {order.toAddress.city}
        </span>
      </div>
      <div className="order-detail">
        <span>Preferred Date:</span>
        <span>{formatDate(order.preferredDates[0])}</span>
      </div>
      <div className="order-detail">
        <span>Helpers:</span>
        <span>{order.helpersCount}</span>
      </div>
      <div className="order-detail">
        <span>Estimated Hours:</span>
        <span>{order.estimatedHours}</span>
      </div>
      <div className="order-detail">
        <span>Estimated Total Price:</span>
        <span>{order.totalPrice} €</span>
      </div>
      {order.notes && (
        <div className="order-detail">
          <span>Additional Notes:</span>
          <span>{order.notes}</span>
        </div>
      )}
    </div>
  );
};

const OrderDetails = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const orderDetailsLoading = useLoading("api", "orderDetails");
  const cancelLoading = useLoading("api", "cancelOrder");

  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Invalid Order ID");
        orderDetailsLoading.stopLoading();
        return;
      }

      orderDetailsLoading.startLoading();
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
        orderDetailsLoading.stopLoading();
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
    cancelLoading.startLoading();
    try {
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
      cancelLoading.stopLoading();
    }
  };

  if (orderDetailsLoading.isLoading) {
    return (
      <div className="container">
        <Loader text="Loading order details..." />
      </div>
    );
  }

  if (error) {
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
  }

  if (!order || !company) {
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
  }

  return (
    <div className="container">
      <h1>Order Details</h1>

      <OrderInfo order={order} company={company} />

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
                disabled={cancelLoading.isLoading}
              >
                {cancelLoading.isLoading
                  ? "Cancelling..."
                  : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
