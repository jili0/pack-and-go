"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function CompanyDashboard() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();

  const [company, setCompany] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && (!account || account.role !== "company")) {
      router.push("/login");
      return;
    }

    if (!authLoading && account) {
      fetchCompanyData();
    }
  }, [account, authLoading, router]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);

      const [companyRes, ordersRes] = await Promise.all([
        fetch("/api/company/me"),
        fetch("/api/orders"),
      ]);

      if (!companyRes.ok) {
        if (companyRes.status === 404) {
          router.push("/company/setup");
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
      setLoading(false);
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

  // Calculate stats directly
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;
  const revenue = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const thisMonthOrders = orders.filter((order) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(order.createdAt) >= thisMonth;
  }).length;
  const recentOrders = orders.slice(0, 5);

  if (authLoading || loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <h3>Company Profile Not Found</h3>
        <p>You need to set up your company profile first.</p>
        <Link href="/company/setup" className="btn-primary">
          Set Up Company Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div>
        <h1>Welcome, {company.companyName}!</h1>
        <p>Manage your moving requests and company profile</p>
      </div>

      {/* Verification Status */}
      {!company.isVerified && (
        <div className="verification-warning">
          <h3>Verification Pending</h3>
          <p>
            Your company profile is currently being reviewed. You can only
            receive moving requests after verification.
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="admin-stats">
        <div>
          <h3>Total Requests</h3>
          <p>{totalOrders}</p>
        </div>
        <div>
          <h3>Pending</h3>
          <p>{pendingOrders}</p>
        </div>
        <div>
          <h3>This Month</h3>
          <p>{thisMonthOrders}</p>
        </div>
        <div>
          <h3>Revenue</h3>
          <p>{formatCurrency(revenue)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2>Quick Access</h2>
        <div className="quick-actions">
          <Link href="/company/orders" className="btn-primary">
            Manage All Requests
          </Link>
          <Link href="/company/profile" className="btn-primary">
            Edit Company Profile
          </Link>
          <Link href="/company/reviews" className="btn-primary">
            View Reviews
          </Link>
        </div>
      </div>

      {/* Company Info */}
      <div className="user-card">
        <div>
          <h3>{company.companyName}</h3>
          <p>
            {company.address?.street}, {company.address?.postalCode}{" "}
            {company.address?.city}
          </p>
          <p>
            Rating: {(company.averageRating || 0).toFixed(1)} / 5.0 (
            {company.reviewsCount || 0} reviews)
          </p>
          <p>
            Status: {company.isVerified ? "Verified" : "Verification Pending"}
          </p>
        </div>
        <Link href="/company/profile" className="btn-primary">
          Edit
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="section-header">
          <h2>Recent Requests</h2>
          <Link href="/company/orders">View All →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No Requests Available</h3>
            <p>You currently have no moving requests.</p>
          </div>
        ) : (
          <div>
            {recentOrders.map((order) => (
              <div key={order._id} className="order-card">
                <p>
                  <strong>Customer:</strong>{" "}
                  {order.accountId?.name || "Unknown"}
                </p>
                <p>
                  <strong>Route:</strong> {order.fromAddress.city} →{" "}
                  {order.toAddress.city}
                </p>
                <p>
                   <strong>Date:</strong>{" "}
                    {order.confirmedDate ? (
                   <span>Confirmed: {formatDate(order.confirmedDate)}</span>
                    ) : order.preferredDates?.length > 0 ? (
                   <span>
                      Preferred: {order.preferredDates.map((date, index) => (
                        <span key={index}>
                        {index > 0 && ", "}
                        {formatDate(date)}
                   </span>
                  ))}
                  </span>
                  ) : (
                 "No date specified"
                   )}
</p>
                <p>
                  <strong>Status:</strong> {order.status}
                </p>
                <p>
                  <strong>Price:</strong> {formatCurrency(order.totalPrice)}
                </p>
                <Link
                  href={`/company/orders/${order._id}`}
                  className="btn-primary"
                >
                  Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Areas */}
      {company.serviceAreas && company.serviceAreas.length > 0 && (
        <div>
          <div className="section-header">
            <h2>Your Service Areas</h2>
            <Link href="/company/profile">Edit →</Link>
          </div>
          <div className="service-areas">
            {company.serviceAreas.map((area, index) => (
              <span key={index} className="service-area-tag">
                {area.from} → {area.to}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
