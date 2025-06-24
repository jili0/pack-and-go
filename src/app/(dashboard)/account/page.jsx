"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AccountDashboard() {
  const router = useRouter();
  const { account, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !account) {
      router.push("/login?redirect=/account");
    }
  }, [account, loading, router]);

  useEffect(() => {
    if (!account) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/account/orders");
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders);
          const now = new Date();
          const upcoming = data.orders.filter((order) => {
            const orderDate = order.confirmedDate
              ? new Date(order.confirmedDate)
              : order.preferredDates.length > 0
                ? new Date(order.preferredDates[0])
                : null;
            return orderDate && orderDate >= now;
          });

          const past = data.orders.filter((order) => {
            const orderDate = order.confirmedDate
              ? new Date(order.confirmedDate)
              : order.preferredDates.length > 0
                ? new Date(order.preferredDates[0])
                : null;
            return !orderDate || orderDate < now;
          });

          setUpcomingOrders(upcoming);
          setPastOrders(past);
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
  }, [account]);

  if (loading || (!account && !loading)) {
    return (
      <div className="container">
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
        <h2>Loading...</h2>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("de-DE", options);
  };

  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: "Request Sent",
      confirmed: "Confirmed",
      declined: "Declined",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return <span>{statusMap[status] || status}</span>;
  };

  return (
    <main className="container">
      <div>
        <h1>Hello, {account.name}</h1>
        <p>Welcome to your personal dashboard</p>
      </div>

      <section>
        <h2>Quick Access</h2>
        <div className="quick-actions">
          <a href="/" className="quick-action-link">
            <svg
              className="quick-action-icon"
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
            <div>
              <h3>Plan a New Move</h3>
              <p>Receive offers from moving companies</p>
            </div>
          </a>

          <a href="/account/orders" className="quick-action-link">
            <svg
              className="quick-action-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <div>
              <h3>My Orders</h3>
              <p>View all your moves</p>
            </div>
          </a>
        </div>
      </section>

      {error && (
        <div className="error">
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
          <h3>An error has occurred</h3>
          <p>{error}</p>
        </div>
      )}

      <section>
        <div className="section-header">
          <h2>Upcoming Moves</h2>
          <Link href="/account/orders">View All</Link>
        </div>

        {dataLoading ? (
          <p>Loading orders...</p>
        ) : upcomingOrders.length > 0 ? (
          <div>
            {upcomingOrders.slice(0, 3).map((order) => (
              <div key={order._id} className="order-card">
                <div>
                  <h3>
                    Move from {order.fromAddress.city} to {order.toAddress.city}
                  </h3>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <div>
                    <p>Moving Company</p>
                    <p>{order.companyName}</p>
                  </div>
                  <div>
                    <p>Moving Date</p>
                    <p>
                      {/* {order.confirmedDate
                        ? formatDate(order.confirmedDate)
                        : order.preferredDates &&
                            order.preferredDates.length > 0
                          ? formatDate(order.preferredDates[0]) +
                            " (not confirmed)"
                          : "No date set"} */}
                          {order.confirmedDate
                        ? formatDate(order.confirmedDate)
                        : order.preferredDates &&
                            "(waiting for confirmation)"}
                    </p>
                  </div>
                  <div>
                    <p>Helpers / Hours</p>
                    <p>
                      {order.helpersCount} Helpers / {order.estimatedHours}{" "}
                      Hours
                    </p>
                  </div>
                  <div>
                    <p>Price</p>
                    <p>{order.totalPrice} €</p>
                  </div>
                </div>
                <Link href={`/account/orders/${order._id}`}>View Details</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
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
            <h3>No Upcoming Moves</h3>
            <p>You currently have no planned moves.</p>
            <Link href="/" className="btn-primary">
              Plan a Move Now
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2>Recent Activities</h2>

        {dataLoading ? (
          <p>Loading activities...</p>
        ) : orders.length > 0 ? (
          <ul className="activity-list">
            {orders.slice(0, 5).map((order) => (
              <li key={order._id} className="activity-item">
                <div className="activity-content">
                  <h3>
                    {order.status === "pending" && "Move request sent"}
                    {order.status === "confirmed" && "Move confirmed"}
                    {order.status === "declined" && "Move request declined"}
                    {order.status === "completed" && "Move completed"}
                    {order.status === "cancelled" && "Move cancelled"}
                  </h3>
                  <p>
                    Move from {order.fromAddress.city} to {order.toAddress.city}
                  </p>
                  <span>Order create: </span><time>{formatDate(order.createdAt)}</time>
                </div>
                <Link href={`/account/orders/${order._id}`}>
                  View Order Details
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3>No Activities</h3>
            <p>There is no activity on your account yet.</p>
          </div>
        )}
      </section>

      <section className="support-section">
        <a href="/#contact" className="quick-action-link">
          <svg
            className="quick-action-icon"
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
          <p>Do you have any questions? Our team will be happy to help you</p>
        </a>
      </section>
    </main>
  );
}
