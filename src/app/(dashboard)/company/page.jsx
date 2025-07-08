// CompanyDashboard.jsx - Korrigierte Version mit passenden CSS-Klassen

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";
import { useSocket } from "@/context/useSocket";
import NotificationButton from "@/components/ui/NotificationButton";

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

  const {  
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
  const emitOrderConfirmed = async (orderId, accountId) => {
    try {
      const res = await fetch("/api/socket/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "order-confirmed",
          data: { orderId, accountId },
        }),
      });
  
      if (!res.ok) {
        console.warn("⚠️ Socket emit order-confirmed failed");
      }
    } catch (err) {
      console.error("❌ Error in emitOrderConfirmed:", err);
    }
  };
  
  const emitOrderCancelled = async (orderId, accountId) => {
    try {
      const res = await fetch("/api/socket/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "order-cancelled",
          data: { orderId, accountId },
        }),
      });
  
      if (!res.ok) {
        console.warn("⚠️ Socket emit order-cancelled failed");
      }
    } catch (err) {
      console.error("❌ Error in emitOrderCancelled:", err);
    }
  };
  
  
  useEffect(() => {
    if (isConnected && account?.id && account?.role && !registeredRef.current) {
      console.log("🔌 Registering company user:", account.id, account.role);
      registerUser(account.id, account.role);
      registeredRef.current = true;
      setHasRegistered(true);
    }
  }, [isConnected, account?.id, account?.role, registerUser]);

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
  
        // ✅ FIX: Korrekte Extraktion der accountId
        const affectedOrder = result.updatedOrder || result.order;
        let userId;
  
        // Verschiedene Möglichkeiten, wie accountId zurückgegeben werden kann
        if (affectedOrder?.accountId) {
          if (typeof affectedOrder.accountId === 'string') {
            userId = affectedOrder.accountId;
          } else if (affectedOrder.accountId._id) {
            userId = affectedOrder.accountId._id;
          }
        }
  
        // ✅ Fallback: Suche in der lokalen orders-Liste
        if (!userId) {
          const localOrder = orders.find(order => order._id === orderId);
          if (localOrder?.accountId) {
            if (typeof localOrder.accountId === 'string') {
              userId = localOrder.accountId;
            } else if (localOrder.accountId._id) {
              userId = localOrder.accountId._id;
            }
          }
        }
  
        console.log("🔍 Debug Info:");
        console.log("  - Order ID:", orderId);
        console.log("  - Updates:", updates);
        console.log("  - Affected Order:", affectedOrder);
        console.log("  - Extracted User ID:", userId);
  
        // ✅ Emit socket notification for confirmed
        if (updates.status === "confirmed" && userId) {
          try {
            console.log("📡 Emitting order-confirmed for user:", userId);
            const socketResponse = await fetch("/api/socket/emit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                event: "order-confirmed",
                data: {
                  orderId,
                  accountId: userId,
                },
              }),
            });
  
            if (socketResponse.ok) {
              console.log("✅ Socket event order-confirmed emitted successfully");
              const socketResult = await socketResponse.json();
              console.log("  - Socket response:", socketResult);
            } else {
              console.warn("⚠️ Failed to emit socket event order-confirmed");
              const errorText = await socketResponse.text();
              console.warn("  - Error:", errorText);
            }
          } catch (error) {
            console.error("❌ Error emitting order-confirmed:", error);
          }
        }
  
        // ✅ Emit socket notification for cancelled
        if (updates.status === "cancelled" && userId) {
          try {
            console.log("📡 Emitting order-cancelled for user:", userId);
            const socketResponse = await fetch("/api/socket/emit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                event: "order-cancelled",
                data: {
                  orderId,
                  accountId: userId,
                },
              }),
            });
  
            if (socketResponse.ok) {
              console.log("✅ Socket event order-cancelled emitted successfully");
              const socketResult = await socketResponse.json();
              console.log("  - Socket response:", socketResult);
            } else {
              console.warn("⚠️ Failed to emit socket event order-cancelled");
              const errorText = await socketResponse.text();
              console.warn("  - Error:", errorText);
            }
          } catch (error) {
            console.error("❌ Error emitting order-cancelled:", error);
          }
        }
  
        // ✅ Warnung wenn keine userId gefunden wurde
        if ((updates.status === "confirmed" || updates.status === "cancelled") && !userId) {
          console.error("❌ No user ID found for notification!");
          console.error("  - Order:", affectedOrder);
          console.error("  - Local Orders:", orders);
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
  const getFilteredNotifications = () => {
  if (!account?.role) return [];

  return notifications.filter(({ type, target }) => {
    if (target) {
      switch (account.role) {
        case 'user':
          return target === 'user' || target === 'all';
        case 'company':
          return target === 'company' || target === 'all';
        case 'admin':
          return true;
        default:
          return false;
      }
    }

    // Fallback (optional)
    return false;
  });
};

const filteredNotifications = getFilteredNotifications();


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
        <div>
           <NotificationButton account={account} />
        </div>
      </div>

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