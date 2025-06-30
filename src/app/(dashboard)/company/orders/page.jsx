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
  const getStatusColor = (status) => `status-${status}` || "";

  useEffect(() => {
    if (!authLoading && (!account || account.role !== "company")) {
      router.push("/login");
      return;
    }
    if (!authLoading && account) fetchOrders();
  }, [account, authLoading, router]);

  const fetchOrders = async () => {
    ordersLoading.startLoading();
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Error loading orders");
      const result = await response.json();
      if (result.success) {
        setOrders(result.orders);
      } else {
        setError(result.message || "Error loading orders");
      }
    } catch (error) {
      setError("Error loading orders. Please try again.");
    } finally {
      ordersLoading.stopLoading();
    }
  };

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
      } else {
        alert(result.message || "Error updating order");
      }
    } catch (error) {
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

  const handleConfirmWithDate = (orderId) => {
    const selectedDate = selectedDates[orderId];
    if (selectedDate) {
      updateOrder(orderId, {
        status: "confirmed",
        confirmedDate: selectedDate,
      });
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
    <button onClick={() => setFilter(status)}>
      {status === "all"
        ? "All"
        : status.charAt(0).toUpperCase() + status.slice(1)}{" "}
      ({count})
    </button>
  );

  const OrderActions = ({ order }) => (
    <>
      {order.status === "pending" && (
        <>
          {order.preferredDates?.length > 0 ? (
            <div>
              <select
                value={selectedDates[order._id] || ""}
                onChange={(e) =>
                  setSelectedDates((prev) => ({
                    ...prev,
                    [order._id]: e.target.value,
                  }))
                }
              >
                <option value="">Choose a date</option>
                {order.preferredDates.map((date, index) => (
                  <option key={index} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleConfirmWithDate(order._id)}
                disabled={!selectedDates[order._id]}
              >
                Confirm with Selected Date
              </button>
            </div>
          ) : (
            <button
              onClick={() => updateOrder(order._id, { status: "confirmed" })}
            >
              Confirm Order
            </button>
          )}
          <button
            onClick={() => updateOrder(order._id, { status: "cancelled" })}
          >
            Decline Order
          </button>
        </>
      )}
      {order.status === "confirmed" && (
        <button onClick={() => updateOrder(order._id, { status: "completed" })}>
          Mark as Completed
        </button>
      )}
      <Link href={`/company/orders/${order._id}`}>View Details</Link>
      <button onClick={() => deleteOrder(order._id)}>Delete Order</button>
    </>
  );

  if (authLoading || ordersLoading.isLoading) {
    return (
      <div>
        <Loader text="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchOrders}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1>Manage Orders</h1>
        <p>View and manage all your moving requests</p>
        <Link href="/company">Back to Dashboard</Link>
      </div>

      <div>
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

      <div>
        <StatusButton status="all" count={orderStats.total} />
        <StatusButton status="pending" count={orderStats.pending} />
        <StatusButton status="confirmed" count={orderStats.confirmed} />
        <StatusButton status="completed" count={orderStats.completed} />
        <StatusButton status="cancelled" count={orderStats.cancelled} />
      </div>

      {filteredOrders.length === 0 ? (
        <div>
          <h3>No Orders Found</h3>
          <p>
            {filter === "all"
              ? "You currently have no moving requests."
              : `No ${filter} orders found.`}
          </p>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div key={order._id}>
            <div>
              <h3>Order #{order._id.slice(-6)}</h3>
              <span className={getStatusColor(order.status)}>
                {order.status.toUpperCase()}
              </span>
              <small>Request created: {formatDate(order.createdAt)}</small>
            </div>

            <div>
              <div>
                <strong>Customer:</strong> {order.accountId?.name || "Unknown"}
              </div>
              <div>
                <strong>Email:</strong> {order.accountId?.email || "N/A"}
              </div>
              <div>
                <strong>Route:</strong> {order.fromAddress?.city} →{" "}
                {order.toAddress?.city}
              </div>
              <div>
                <strong>Moving Date:</strong>
                {order.confirmedDate ? (
                  <span>Confirmed: {formatDate(order.confirmedDate)}</span>
                ) : order.preferredDates?.length > 0 ? (
                  <div>
                    Customer's preferred dates:
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
              <div>
                <strong>Price:</strong> {formatCurrency(order.totalPrice)}
              </div>
              {order.rooms && (
                <div>
                  <strong>Rooms:</strong> {order.rooms} room(s)
                </div>
              )}
            </div>

            <div>
              <OrderActions order={order} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
