// src/components/dashboard/OrderList.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const OrderList = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/user/orders");
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.message || "Failed to load orders.");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No date specified";

    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: null, text: "Request Sent" },
      confirmed: { class: null, text: "Confirmed" },
      declined: { class: null, text: "Declined" },
      completed: { class: null, text: "Completed" },
      cancelled: { class: null, text: "Cancelled" },
    };

    const statusInfo = statusMap[status] || {
      class: null,
      text: status,
    };

    return <span>{statusInfo.text}</span>;
  };

  const filteredOrders = () => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === filter);
  };

  const handleViewOrder = (orderId) => {
    router.push(`/user/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div>
        <div></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2>My Orders</h2>
        <div>
          <label htmlFor="statusFilter">Filter by status:</label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div>
          <div>📦</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any moving orders yet.</p>
          <button onClick={() => router.push("/")}>Plan Your Move</button>
        </div>
      ) : filteredOrders().length === 0 ? (
        <div>
          <h3>No {filter} Orders</h3>
          <p>You don't have any orders with status "{filter}".</p>
          <button onClick={() => setFilter("all")}>Show All Orders</button>
        </div>
      ) : (
        <div>
          {filteredOrders().map((order) => (
            <div key={order._id}>
              <div>
                <div>
                  <span>{formatDate(order.createdAt)}</span>
                  {getStatusBadge(order.status)}
                </div>
                <div>{order.totalPrice} €</div>
              </div>

              <div>
                <div>
                  <div>
                    <span>From:</span>
                    <span>{order.fromAddress.city}</span>
                  </div>
                  <div>→</div>
                  <div>
                    <span>To:</span>
                    <span>{order.toAddress.city}</span>
                  </div>
                </div>

                <div>
                  <span>Company:</span>
                  <span>{order.companyName}</span>
                </div>

                <div>
                  <span>
                    {order.status === "pending"
                      ? "Preferred Date:"
                      : "Moving Date:"}
                  </span>
                  <span>
                    {order.confirmedDate
                      ? formatDate(order.confirmedDate)
                      : formatDate(order.preferredDates[0])}
                    {order.status === "pending" && (
                      <span>(waiting for confirmation)</span>
                    )}
                  </span>
                </div>
              </div>

              <div>
                <button onClick={() => handleViewOrder(order._id)}>
                  View Details
                </button>

                {order.status === "completed" && !order.review && (
                  <button
                    onClick={() =>
                      router.push(`/user/orders/${order._id}/review`)
                    }
                  >
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <button onClick={() => router.push("/")}>Plan a New Move</button>
      </div>
    </div>
  );
};

export default OrderList;
