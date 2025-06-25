"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const LOADING_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const ERROR_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  </svg>
);

const EMPTY_STATE_ICON = (
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
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);

export default function AccountDashboard() {
  const router = useRouter();
  const { account, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
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

  useEffect(() => {
    if (!loading && !account) {
      router.push("/login?redirect=/account");
      return;
    }

    if (!account) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/account/orders");
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
          setError(
            data.message || "Die Bestellungen konnten nicht geladen werden."
          );
        }
      } catch (error) {
        console.error("Fehler beim Laden der Bestellungen:", error);
        setError(
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchOrders();
  }, [account, loading, router]);

  if (loading || (!account && !loading)) {
    return (
      <div className="container">
        {LOADING_ICON}
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Hello, {account.name}</h1>
      <p>Welcome to your personal dashboard</p>

      <div className="quick-actions">
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
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h3>Need help?</h3>
            <p>Our team will be happy to help you</p>
          </div>
        </a>
      </div>

      {error && (
        <div className="error">
          {ERROR_ICON}
          <h3>An error has occurred</h3>
          <p>{error}</p>
        </div>
      )}

      <section>
        <h2>View Orders</h2>

        {dataLoading ? (
          <p>Loading orders...</p>
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
                    <strong>Moving Company:</strong> {order.companyName}
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
          <div className="empty-state">
            {EMPTY_STATE_ICON}
            <h3>No Upcoming Moves</h3>
            <p>You currently have no planned moves.</p>
            <Link href="/" className="btn-primary">
              Plan a Move Now
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}