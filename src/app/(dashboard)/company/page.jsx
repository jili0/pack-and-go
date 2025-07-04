// CompanyDashboard.jsx - Korrigierte Version mit passenden CSS-Klassen

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";
import { useSocket } from "@/context/useSocket";

export default function CompanyDashboard() {
  const router = useRouter();
  const { account, initialCheckDone } = useAuth();
  const dashboardLoading = useLoading("api", "companyDashboard");
  const [company, setCompany] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedDates, setSelectedDates] = useState({});
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { 
    emitOrderConfirmed, 
    emitOrderCancelled, 
    registerUser, 
    isConnected,
    notifications,
    clearNotifications 
  } = useSocket();

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("de-DE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No date";

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "yellow";
      case "confirmed":
        return "green";
      case "cancelled":
        return "error";
      case "completed":
      default:
        return "";
    }
  };

  const fetchOrdersOnly = useCallback(async () => {
    try {
      const ordersRes = await fetch("/api/orders");
      const ordersData = await ordersRes.json();

      if (ordersData.success) {
        setOrders(ordersData.orders);
        console.log("📋 Orders refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  }, []);

  const fetchCompanyData = useCallback(async () => {
    dashboardLoading.startLoading();
    try {
      const [companyRes, ordersRes] = await Promise.all([
        fetch("/api/company/me"),
        fetch("/api/orders"),
      ]);

      if (!companyRes.ok) {
        if (companyRes.status === 404) {
          router.push("/company/profile");
          return;
        }
        throw new Error("Error loading company data");
      }

      const companyData = await companyRes.json();
      const ordersData = await ordersRes.json();

      if (companyData.success) {
        setCompany(companyData.company);
      }

      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("An error occurred while loading dashboard data.");
    } finally {
      dashboardLoading.stopLoading();
    }
  }, [router]);

  useEffect(() => {
    if (!initialCheckDone) {
      console.log("Waiting for initial auth check...");
      return;
    }

    if (!account) {
      console.log("No account found, redirecting to login");
      router.push("/login");
      return;
    }

    if (account.role !== "company") {
      console.log("Not a company account, redirecting to home");
      router.push("/");
      return;
    }

    console.log("Auth OK, fetching company data");
    fetchCompanyData();
  }, [initialCheckDone, account, router, fetchCompanyData]);

  const registeredRef = useRef(false);
  
  useEffect(() => {
    if (isConnected && account?.id && account?.role && !registeredRef.current) {
      console.log("🔌 Registering company user:", account.id, account.role);
      registerUser(account.id, account.role);
      registeredRef.current = true;
      setHasRegistered(true);
    }
  }, [isConnected, account?.id, account?.role, registerUser]);

  useEffect(() => {
    if (!company) return;

    const hasNewOrderNotifications = notifications.some(
      (n) => n.type === 'order-created' || n.type === 'newBookingRequest'
    );
    
    if (hasNewOrderNotifications) {
      console.log("📦 New order notification received, refreshing orders...");
      fetchOrdersOnly();
      setShowNotifications(true);
      
      // Auto-hide nach 5 Sekunden
      setTimeout(() => {
        setShowNotifications(false);
      }, 5000);
    }
  }, [notifications, company, fetchOrdersOnly]);

  const updateOrder = async (orderId, updates) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const result = await response.json();

      if (result.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...updates } : order
          )
        );

        if (updates.status === "confirmed" && updates.confirmedDate) {
          setSelectedDates((prev) => {
            const updated = { ...prev };
            delete updated[orderId];
            return updated;
          });
        }

        const affectedOrder = result.updatedOrder || result.order;
        const userId = affectedOrder?.accountId?._id || affectedOrder?.accountId;

        if (updates.status === "confirmed" && userId) {
          console.log(`✅ Sending order confirmation notification for order ${orderId} to user ${userId}`);
          emitOrderConfirmed(orderId, userId);
        }

        if (updates.status === "cancelled" && userId) {
          console.log(`❌ Sending order cancellation notification for order ${orderId} to user ${userId}`);
          emitOrderCancelled(orderId, userId);
        }
      } else {
        alert(result.message || "Error updating order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order. Please try again.");
    }
  };

  const deleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    )
      return;
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
        setSelectedDates((prev) => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
      } else {
        alert(result.message || "Error deleting order");
      }
    } catch (error) {
      alert("Error deleting order. Please try again.");
    }
  };

  const handleConfirmWithDate = async (orderId) => {
    const selectedDate = selectedDates[orderId];
    if (selectedDate) {
      setConfirmingOrderId(orderId);
      await updateOrder(orderId, {
        status: "confirmed",
        confirmedDate: selectedDate,
      });
      setConfirmingOrderId(null);
    } else {
      alert("Please select a date first");
    }
  };

  const filteredOrders = orders.filter(
    (order) => filter === "all" || order.status === filter
  );

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const StatusButton = ({ status, count }) => (
    <button className="btn-secondary" onClick={() => setFilter(status)}>
      {status === "all"
        ? "All"
        : status.charAt(0).toUpperCase() + status.slice(1)}
      &nbsp; ({count})
    </button>
  );

  const OrderActions = ({ order }) => (
    <>
      {order.status === "pending" && (
        <>
          {order.preferredDates?.length > 0 ? (
            <button
              className="btn-primary"
              onClick={() => handleConfirmWithDate(order._id)}
              disabled={
                !selectedDates[order._id] || confirmingOrderId === order._id
              }
            >
              {confirmingOrderId === order._id ? "Confirming..." : "Confirm"}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => updateOrder(order._id, { status: "confirmed" })}
            >
              Confirm Order
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() => updateOrder(order._id, { status: "cancelled" })}
          >
            Cancel Order
          </button>
        </>
      )}
      {order.status === "confirmed" && (
        <button
          className="btn-primary"
          onClick={() => updateOrder(order._id, { status: "completed" })}
        >
          Mark as Completed
        </button>
      )}

      <button className="btn-primary" onClick={() => deleteOrder(order._id)}>
        Delete
      </button>
    </>
  );

  // Early Returns
  if (!initialCheckDone) {
    return (
      <div className="container">
        <Loader text="Checking authentication..." />
      </div>
    );
  }

  if (!account || account.role !== "company") {
    return (
      <div className="container">
        <Loader text="Redirecting..." />
      </div>
    );
  }

  if (dashboardLoading.isLoading) {
    return (
      <div className="container">
        <Loader text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={fetchCompanyData}>
          Retry
        </button>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container">
        <h3>Company Profile Not Found</h3>
        <p>You need to set up your company profile first.</p>
        <Link href="/company/profile" className="btn-primary">
          Set Up Company Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Welcome, {company.companyName}!</h1>
      </div>

      <div className="dashboard-actions">
        <Link href="/company/profile" className="btn-primary">
          Edit Profile
        </Link>
        <Link href="/company/reviews" className="btn-primary">
          View Reviews
        </Link>
        {notifications.length > 0 && (
          <button onClick={clearNotifications} className="btn-secondary">
            Clear Notifications ({notifications.length})
          </button>
        )}
      </div>

      {/* ✅ KORRIGIERT: Notification Display mit richtigen CSS-Klassen */}
      {(notifications.length > 0 || showNotifications) && (
        <div className="notification-bar">
          <div className="notification-list">
            {notifications.map((notification, index) => (
              <div key={index} className="notification-box">
                <div className="notification-content">
                  <div className="notification-header-item">
                    <span className="notification-type">
                      {notification.type === 'order-created' ? '📦 New Order Request!' : 
                       notification.type === 'newBookingRequest' ? '🔔 New Booking Request!' : 
                       '📋 Order Update'}
                    </span>
                    <span className="notification-time">
                      {new Date().toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="notification-message">
                    {notification.message || 'You have received a new order request from a customer.'}
                  </div>
                  {notification.orderId && (
                    <div className="notification-meta">
                      Order ID: {notification.orderId}
                    </div>
                  )}
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => {
                    // Einzelne Notification löschen (falls implementiert)
                    console.log('Delete notification:', notification);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={clearNotifications} 
            className="notification-clear-btn"
          >
            Clear All Notifications ({notifications.length})
          </button>
        </div>
      )}

      {!company.isVerified && (
        <p className="verification-warning">
          Your company profile is currently being reviewed. You can only receive
          moving requests after verification.
        </p>
      )}

      <div className="order-filters">
        <StatusButton status="all" count={orderStats.total} />
        <StatusButton status="pending" count={orderStats.pending} />
        <StatusButton status="confirmed" count={orderStats.confirmed} />
        <StatusButton status="completed" count={orderStats.completed} />
        <StatusButton status="cancelled" count={orderStats.cancelled} />
      </div>

      {filteredOrders.length === 0 ? (
        <p className="error">
          {filter === "all"
            ? "You currently have no moving requests."
            : `No ${filter} orders found.`}
        </p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order._id} className="company-order-card">
            <p>
              <strong>Order&nbsp;</strong>
              {order._id}&nbsp;|&nbsp;{formatDate(order.createdAt)}&nbsp;
              <span className={getStatusColor(order.status)}>
                ({order.status.toUpperCase()})
              </span>
            </p>
            <div className="row">
              <p>
                <strong>Customer:</strong> {order.accountId?.name}
              </p>
              <p>
                <strong>Email:</strong> {order.accountId?.email}
              </p>
            </div>

            <div className="row">
              <p>
                <strong>From:</strong> {order.fromAddress?.street},&nbsp;
                {order.fromAddress?.postalCode} {order.fromAddress?.city}
              </p>
              <p>
                <strong>To:</strong> {order.toAddress?.street},&nbsp;
                {order.toAddress?.postalCode} {order.toAddress?.city}
              </p>
            </div>

            <div className="row">
              <p>
                <strong>Helpers:</strong> {order.helpersCount}
              </p>
              <p>
                <strong>Estimated Hours:</strong> {order.estimatedHours}
              </p>
            </div>

            <p>
              {order.confirmedDate ? (
                <>
                  <strong>Moving Date:</strong>
                  <span> {formatDate(order.confirmedDate)}</span>
                </>
              ) : order.preferredDates?.length > 0 ? (
                <>
                  <strong className="error">
                    Select and Confirm Moving Date:
                  </strong>

                  {order.preferredDates.map((date, index) => (
                    <span key={index}>
                      <button
                        className="btn-secondary underlined"
                        onClick={() =>
                          setSelectedDates((prev) => ({
                            ...prev,
                            [order._id]: date,
                          }))
                        }
                      >
                        {selectedDates[order._id] === date ? (
                          <b>{formatDate(date)}</b>
                        ) : (
                          formatDate(date)
                        )}
                      </button>
                      {index < order.preferredDates.length - 1 && " | "}
                    </span>
                  ))}
                </>
              ) : (
                "Not specified"
              )}
            </p>

            {order.notes && (
              <p>
                <strong>Notes:</strong> {order.notes}
              </p>
            )}

            <div className="order-actions">
              <OrderActions order={order} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}