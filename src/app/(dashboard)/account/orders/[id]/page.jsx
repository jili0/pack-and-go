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
        <span>{order.status}</span>
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
  const deleteLoading = useLoading("api", "deleteOrder");

  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ✅ Fixed: useEffect ohne useCallback - stoppt infinite loop
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Invalid Order ID");
        return;
      }

      orderDetailsLoading.startLoading();
      try {
        // ✅ Cache busting mit timestamp
        const timestamp = Date.now();
        const response = await fetch(`/api/orders/${orderId}?t=${timestamp}`);
        const data = await response.json();

        if (data.success) {
          setOrder(data.order);
          setCompany(data.company);
          console.log("✅ Order details refreshed");
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
  }, [orderId, refreshTrigger]); // ✅ Nur orderId und refreshTrigger

  // ✅ Auto-refresh when page gets focus (z.B. nach Admin-Review-Delete)
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔄 Page focused, refreshing order data...");
      setRefreshTrigger(prev => prev + 1);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Page became visible, refreshing order data...");
        setRefreshTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // ✅ Leere dependencies - keine loops

  const handleCancelOrder = async () => {
    cancelLoading.startLoading();
    try {
      console.log("🚫 Starting order cancellation process...");
      console.log("📊 Complete Order data:", JSON.stringify(order, null, 2));
      console.log("🏢 Complete Company data:", JSON.stringify(company, null, 2));

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await response.json();

      if (data.success) {
        console.log("✅ Order cancelled successfully in database");
        
        // ✅ Socket-Event wird bereits von der API Route gesendet
        // Das Backend sendet das Event automatisch über globalThis.io
        console.log("🔔 Socket notification handled by API route - no additional notification needed");

        setOrder(data.order);
        setShowCancelModal(false);
        console.log("✅ Order cancellation completed");
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

  const handleDeleteOrder = async () => {
    deleteLoading.startLoading();
    try {
      console.log("🗑️ Deleting order:", orderId);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      
      console.log("📊 Delete response status:", response.status);
      console.log("📊 Delete response ok:", response.ok);
      
      // ✅ Spezielle Behandlung für 405 Error
      if (response.status === 405) {
        console.error("❌ DELETE method not allowed - API route may be missing DELETE handler");
        setError("Delete operation not supported. Please contact support.");
        return;
      }
      
      // ✅ Prüfe Response Status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // ✅ Prüfe ob Response Content hat
      const text = await response.text();
      console.log("📄 Raw response text:", text);
      
      if (!text.trim()) {
        // Leere Response - aber erfolgreich gelöscht
        console.log("✅ Empty response, assuming success");
        router.push("/account");
        return;
      }
      
      // ✅ Versuche JSON zu parsen
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("❌ JSON parse error:", jsonError);
        console.error("📄 Response text was:", text);
        throw new Error("Invalid server response");
      }

      if (data.success) {
        console.log("✅ Order deleted successfully");
        router.push("/account");
      } else {
        console.error("❌ Delete failed:", data.message);
        setError(data.message || "Failed to delete order.");
      }
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      deleteLoading.stopLoading();
    }
  };

  // ✅ CHECKS ZUERST - BEVOR DAS JSX RETURN!
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
        <button className="btn-primary" onClick={() => router.push("/account")}>
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
        <button className="btn-primary" onClick={() => router.push("/account")}>
          Back to Orders
        </button>
      </div>
    );
  }

  // ✅ JETZT IST order GARANTIERT NICHT NULL
  return (
    <div className="container">
      <h1>Order Details</h1>

      <OrderInfo order={order} company={company} />

      <div className="form-footer">
        <button className="btn-primary" onClick={() => router.back()}>
          Back to Dashboard
        </button>
        {(order.status === "pending" || order.status === "confirmed") && (
          <button
            className="btn-primary"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Order
          </button>
        )}
        {order.status === "completed" && (
          <button
            className="btn-primary"
            onClick={() => router.push(`/account/orders/${orderId}/review`)}
          >
            Leave a Review
          </button>
        )}
        {(order.status === "completed" || order.status === "cancelled") && (
          <button
            className="btn-primary"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Order
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

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Order</h3>
            <p>Are you sure you want to delete this order?</p>
            <p>This action cannot be undone.</p>
            <div className="form-footer">
              <button
                className="btn-primary"
                onClick={() => setShowDeleteModal(false)}
              >
                No
              </button>
              <button
                className="btn-primary"
                onClick={handleDeleteOrder}
                disabled={deleteLoading.isLoading}
              >
                {deleteLoading.isLoading ? "Deleting..." : "Yes, Delete Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <h4>Debug Info:</h4>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <p>User Account ID: {order?.accountId || 'Not found'}</p>
            <p>Company Account ID: {company?.accountId || 'Not found'}</p>
            <p>Order ID: {orderId}</p>
            <p>Order Status: {order?.status}</p>
            <p>Refresh Trigger: {refreshTrigger}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;