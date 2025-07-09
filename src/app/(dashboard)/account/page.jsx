"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";
import { useSocket } from "@/context/useSocket";
import NotificationButton from "@/components/ui/NotificationButton";

export default function AccountDashboard() {
  const router = useRouter();
  const { account, loading, initialCheckDone } = useAuth();

  const { isConnected, registerUser, notifications, clearNotifications } =
    useSocket();

  const ordersLoading = useLoading("api", "orders");
  const [orders, setOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getOrderDate = (order) => {
    return (
      order.confirmedDate ||
      (order.preferredDates.length > 0 ? order.preferredDates[0] : null)
    );
  };

  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: "Request Sent",
      confirmed: "Confirmed",
      declined: "Declined",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    const statusClass =
      {
        pending: "yellow",
        confirmed: "green",
        completed: "green",
        declined: "error",
        cancelled: "error",
      }[status] || "";

    return <span className={statusClass}>{statusMap[status] || status}</span>;
  };

  const registeredRef = useRef(false);

  useEffect(() => {
    if (isConnected && account?.id && account?.role && !registeredRef.current) {
      console.log("🔌 Registering customer user:", account.id, account.role);
      registerUser(account.id, account.role);
      registeredRef.current = true;
    }
  }, [isConnected, account?.id, account?.role, registerUser]);

  useEffect(() => {
    if (!initialCheckDone) return;

    if (!account) {
      router.push("/login?redirect=/account");
      return;
    }

    fetchOrders();
  }, [initialCheckDone, account]);

  const fetchOrders = async () => {
    ordersLoading.startLoading();
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        const now = new Date();
        const upcoming = data.orders.filter((order) => {
          const orderDate = getOrderDate(order);
          return orderDate && new Date(orderDate) >= now;
        });
        setUpcomingOrders(upcoming);
      } else {
        setError(data.message || "Orders could not be loaded.");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      ordersLoading.stopLoading();
    }
  };

  if (!initialCheckDone || loading) {
    return (
      <div className="container">
        <Loader text="Loading..." />
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Hello, {account?.name}</h1>
      <p>Welcome to your personal dashboard</p>

      <div>
        <NotificationButton account={account} />
      </div>

      <div className="row">
        <a href="/" className="contact-item quick-action-link">
          <div className="contact-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <div>
            <h3>Plan a New Move</h3>
            <p>Receive offers from moving companies</p>
          </div>
        </a>

        <a href="/#contact" className="contact-item quick-action-link">
          <div className="contact-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="12" fill="#007bff" />
              <path
                d="M5.5 13.5v-1.5a6.5 6.5 0 0 1 13 0v1.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="4.2"
                y="13.5"
                width="3.6"
                height="5"
                rx="1.5"
                fill="white"
              />
              <rect
                x="16.2"
                y="13.5"
                width="3.6"
                height="5"
                rx="1.5"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h3>Need help?</h3>
            <p>Our team will be happy to help you</p>
          </div>
        </a>
      </div>

      {error && <p className="error">{error}</p>}

      <section>
        <h2>View Orders</h2>

        {ordersLoading.isLoading ? (
          <Loader text="Loading orders..." />
        ) : upcomingOrders.length > 0 ? (
          <div>
            {upcomingOrders.map((order) => (
              <Link
                href={`/account/orders/${order._id}`}
                key={order._id}
                className="order-card account-order-card"
              >
                <div>
                  <p>
                    <strong>From:</strong> {order.fromAddress.city}&nbsp;&nbsp;
                    <strong>To:</strong> {order.toAddress.city}
                  </p>
                  <p>
                    <strong>Status:</strong>&nbsp;
                    <StatusBadge status={order.status} />
                  </p>
                  <p>
                    <strong>Moving Date:</strong>&nbsp;
                    {order.status === "cancelled"
                      ? "Not applicable"
                      : order.confirmedDate
                        ? formatDate(order.confirmedDate)
                        : "Waiting for confirmation"}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Moving Company:</strong> {order.companyId?.companyName || order.companyName}
                  </p>
                  <p>
                    <strong>Helpers / Hours:</strong> {order.helpersCount}&nbsp;
                    Helpers / {order.estimatedHours} Hours
                  </p>
                  <p>
                    <strong>Estimated Price:</strong> {order.totalPrice} €
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>You currently have no planned moves.</p>
        )}
      </section>
    </div>
  );
}
