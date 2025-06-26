"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";

export default function CompanyOrders() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();
  const ordersLoading = useLoading("api", "companyOrders");

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedDates, setSelectedDates] = useState({});

  useEffect(() => {
    if (!authLoading && (!account || account.role !== "company")) {
      router.push("/login");
      return;
    }

    if (!authLoading && account) {
      fetchOrders();
    }
  }, [account, authLoading, router]);

  const fetchOrders = async () => {
    ordersLoading.startLoading();
    try {
      const response = await fetch("/api/orders");

      if (!response.ok) {
        throw new Error("Error loading orders");
      }

      const result = await response.json();

      if (result.success) {
        setOrders(result.orders);
      } else {
        setError(result.message || "Error loading orders");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Error loading orders. Please try again.");
    } finally {
      ordersLoading.stopLoading();
    }
  };

  const confirmOrderWithDate = async (orderId, selectedDate) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "confirmed",
          confirmedDate: selectedDate,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the order in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, status: "confirmed", confirmedDate: selectedDate }
              : order
          )
        );
        // Clear the selected date for this order
        setSelectedDates((prev) => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
      } else {
        alert(result.message || "Error confirming order with date");
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Error confirming order. Please try again.");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the order in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert(result.message || "Error updating order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order status. Please try again.");
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
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
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
      console.error("Error deleting order:", error);
      alert("Error deleting order. Please try again.");
    }
  };

  const handleDateSelection = (orderId, selectedDate) => {
    setSelectedDates((prev) => ({
      ...prev,
      [orderId]: selectedDate,
    }));
  };

  const handleConfirmWithDate = (orderId) => {
    const selectedDate = selectedDates[orderId];
    if (selectedDate) {
      confirmOrderWithDate(orderId, selectedDate);
    } else {
      alert("Please select a date first");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "confirmed":
        return "status-confirmed";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (authLoading || ordersLoading.isLoading) {
    return (
      <div className="container">
        <Loader text="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Manage Orders</h1>
          <p>View and manage all your moving requests</p>
        </div>
        <Link href="/company" className="btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="admin-stats">
        <div>
          <h3>Total Orders</h3>
          <p>{orderStats.total}</p>
        </div>
        <div>
          <h3>Pending</h3>
          <p>{orderStats.pending}</p>
        </div>
        <div>
          <h3>Confirmed</h3>
          <p>{orderStats.confirmed}</p>
        </div>
        <div>
          <h3>Completed</h3>
          <p>{orderStats.completed}</p>
        </div>
      </div>

      <div className="filter-buttons">
        <button
          className={filter === "all" ? "btn-primary" : "btn-secondary"}
          onClick={() => setFilter("all")}
        >
          All ({orderStats.total})
        </button>
        <button
          className={filter === "pending" ? "btn-primary" : "btn-secondary"}
          onClick={() => setFilter("pending")}
        >
          Pending ({orderStats.pending})
        </button>
        <button
          className={filter === "confirmed" ? "btn-primary" : "btn-secondary"}
          onClick={() => setFilter("confirmed")}
        >
          Confirmed ({orderStats.confirmed})
        </button>
        <button
          className={filter === "completed" ? "btn-primary" : "btn-secondary"}
          onClick={() => setFilter("completed")}
        >
          Completed ({orderStats.completed})
        </button>
        <button
          className={filter === "cancelled" ? "btn-primary" : "btn-secondary"}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled ({orderStats.cancelled})
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No Orders Found</h3>
            <p>
              {filter === "all"
                ? "You currently have no moving requests."
                : `No ${filter} orders found.`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <span
                    className={`status-badge ${getStatusColor(order.status)}`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="order-date">
                  <small>Request created: {formatDate(order.createdAt)}</small>
                </div>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <strong>Customer:</strong>{" "}
                  {order.accountId?.name || "Unknown"}
                </div>
                <div className="detail-row">
                  <strong>Email:</strong> {order.accountId?.email || "N/A"}
                </div>
                <div className="detail-row">
                  <strong>Route:</strong> {order.fromAddress?.city} →{" "}
                  {order.toAddress?.city}
                </div>
                <div className="detail-row">
                  <strong>Moving Date:</strong>&nbsp;
                  {order.confirmedDate ? (
                    <span className="confirmed-date">
                      Confirmed: {formatDate(order.confirmedDate)}
                    </span>
                  ) : order.preferredDates?.length > 0 ? (
                    <div className="preferred-dates">
                      <div>Customer's preferred dates:</div>
                      <ul>
                        {order.preferredDates.map((date, index) => (
                          <li key={index}>
                            Option {index + 1}: {formatDate(date)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    "Not specified"
                  )}
                </div>
                <div className="detail-row">
                  <strong>Price:</strong> {formatCurrency(order.totalPrice)}
                </div>
                {order.rooms && (
                  <div className="detail-row">
                    <strong>Rooms:</strong> {order.rooms} room(s)
                  </div>
                )}
              </div>

              <div className="order-actions">
                {order.status === "pending" && (
                  <>
                    {order.preferredDates?.length > 0 ? (
                      <div className="date-selection-group">
                        <div className="date-selection">
                          <label>Select moving date:</label>
                          <select
                            value={selectedDates[order._id] || ""}
                            onChange={(e) =>
                              handleDateSelection(order._id, e.target.value)
                            }
                          >
                            <option value="">Choose a date</option>
                            {order.preferredDates.map((date, index) => (
                              <option key={index} value={date}>
                                {formatDate(date)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => handleConfirmWithDate(order._id)}
                          className="btn-success"
                          disabled={!selectedDates[order._id]}
                        >
                          Confirm with Selected Date
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          updateOrderStatus(order._id, "confirmed")
                        }
                        className="btn-success"
                      >
                        Confirm Order
                      </button>
                    )}
                    <button
                      onClick={() => updateOrderStatus(order._id, "cancelled")}
                      className="btn-danger"
                    >
                      Decline Order
                    </button>
                  </>
                )}

                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateOrderStatus(order._id, "completed")}
                    className="btn-success"
                  >
                    Mark as Completed
                  </button>
                )}

                <Link
                  href={`/company/orders/${order._id}`}
                  className="btn-primary"
                >
                  View Details
                </Link>

                <button
                  onClick={() => deleteOrder(order._id)}
                  className="btn-danger"
                >
                  Delete Order
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
