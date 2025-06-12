// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function CompanyDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [company, setCompany] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const res = await fetch("/api/company/me", {
//           method: "GET",
//           credentials: "include",
//         });

//         if (!res.ok) {
//           router.push("/login"); // Token ungültig oder abgelaufen
//           return;
//         }

//         const data = await res.json();
//         setCompany(data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Fehler beim Laden des Profils", err);
//         router.push("/login");
//       }
//     }

//     fetchData();
//   }, [router]);

//   if (loading) return <p>Dashboard wird geladen...</p>;

//   return (
//     <div style={{ padding: "2rem" }}>
//       <h1>Willkommen, {company.companyName}!</h1>
//       <p><strong>Steuernummer:</strong> {company.taxId}</p>
//       <p><strong>Stundensatz:</strong> {company.hourlyRate} €</p>
//       <p><strong>Adresse:</strong> {company.street}, {company.postalCode} {company.city}, {company.country}</p>
//       <p><strong>Zertifiziert bei KisteKlar:</strong> {company.isKisteKlarCertified ? "Ja" : "Nein"}</p>

//       <h2>Servicegebiete:</h2>
//       <ul>
//         {company.serviceAreas.map((area, index) => (
//           <li key={index}>
//             {area.from} – {area.to}
//           </li>
//         ))}
//       </ul>

//       <p><strong>Beschreibung:</strong></p>
//       <p>{company.description}</p>

//       {/* Weitere Firmenfunktionen hier */}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "@/components/ui/Image";

export default function CompanyDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [company, setCompany] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0,
    averageRating: 0,
    totalReviews: 0,
    thisMonthOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "company")) {
      router.push("/login");
      return;
    }

    if (!authLoading && user) {
      fetchCompanyData();
    }
  }, [user, authLoading, router]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);

      // Load company data
      const [companyRes, ordersRes] = await Promise.all([
        fetch("/api/company/me"),
        fetch("/api/orders"),
      ]);

      if (!companyRes.ok) {
        if (companyRes.status === 404) {
          // No company data found - redirect to setup page
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
        setRecentOrders(ordersData.orders.slice(0, 5));
        calculateStats(ordersData.orders, companyData.company);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("An error occurred while loading dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData, companyData) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const pending = ordersData.filter(
      (order) => order.status === "pending"
    ).length;
    const confirmed = ordersData.filter(
      (order) => order.status === "confirmed"
    ).length;
    const completed = ordersData.filter(
      (order) => order.status === "completed"
    ).length;
    const thisMonthOrders = ordersData.filter(
      (order) => new Date(order.createdAt) >= thisMonth
    ).length;

    const revenue = ordersData
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    setStats({
      totalOrders: ordersData.length,
      pendingOrders: pending,
      confirmedOrders: confirmed,
      completedOrders: completed,
      averageRating: companyData?.averageRating || 0,
      totalReviews: companyData?.reviewsCount || 0,
      thisMonthOrders,
      revenue,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        class: styles.statusBadge + " " + styles.statuspending,
        text: "Request Received",
      },
      confirmed: {
        class: styles.statusBadge + " " + styles.statusconfirmed,
        text: "Confirmed",
      },
      declined: {
        class: styles.statusBadge + " " + styles.statusdeclined,
        text: "Declined",
      },
      completed: {
        class: styles.statusBadge + " " + styles.statuscompleted,
        text: "Completed",
      },
      cancelled: {
        class: styles.statusBadge + " " + styles.statuscancelled,
        text: "Cancelled",
      },
    };

    const statusInfo = statusMap[status] || {
      class: styles.statusBadge,
      text: status,
    };

    return <span className={statusInfo.class}>{statusInfo.text}</span>;
  };

  if (authLoading || loading) {
    return (
      <div>
        <div></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>
          <div>
            <div>
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
            </div>
            <div>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <div>
          <h3>Company Profile Not Found</h3>
          <p>You need to set up your company profile first.</p>
          <Link href="/company/setup">Set Up Company Profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div>
        <h1>Welcome, {company.companyName}!</h1>
        <p>Manage your moving requests and company profile</p>
      </div>

      {/* Verification Status */}
      {!company.isVerified && (
        <div>
          <div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3>Verification Pending</h3>
              <p>
                Your company profile is currently being reviewed by our team.
                You can only receive moving requests after verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div>
        <div>
          <div>
            <h3>Total Requests</h3>
            <p>{stats.totalOrders}</p>
            <p>All received requests</p>
          </div>
        </div>

        <div>
          <div>
            <h3>Pending</h3>
            <p>{stats.pendingOrders}</p>
            <p>Awaiting your response</p>
          </div>
        </div>

        <div>
          <div>
            <h3>This Month</h3>
            <p>{stats.thisMonthOrders}</p>
            <p>New requests</p>
          </div>
        </div>

        <div>
          <div>
            <h3>Revenue</h3>
            <p>{formatCurrency(stats.revenue)}</p>
            <p>Completed jobs</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2>Quick Access</h2>
        <div>
          <Link href="/company/orders">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            Manage All Requests
          </Link>
          <Link href="/company/profile">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Edit Company Profile
          </Link>
          <Link href="/company/reviews">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            View Reviews
          </Link>
        </div>
      </div>

      {/* Company Info */}
      <div>
        <div>
          <h2>Your Company Profile</h2>
          <Link href="/company/profile">Edit →</Link>
        </div>

        <div>
          <div>
            <div>
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={company.companyName}
                  width={64}
                  height={64}
                />
              ) : (
                <div>
                  <span>{company.companyName.charAt(0)}</span>
                </div>
              )}
            </div>
            <div>
              <h3>{company.companyName}</h3>
              <p>
                {company.address?.street}, {company.address?.postalCode}{" "}
                {company.address?.city}
              </p>
              <div>
                <span>Hourly Rate: €{company.hourlyRate} per helper</span>
                {company.isKisteKlarCertified && (
                  <span>KisteKlar Certified</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <div>
              <span>Rating:</span>
              <span>
                {stats.averageRating.toFixed(1)} / 5.0 ({stats.totalReviews}{" "}
                reviews)
              </span>
            </div>
            <div>
              <span>Status:</span>
              <span>
                {company.isVerified ? (
                  <span>Verified</span>
                ) : (
                  <span>Verification Pending</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div>
          <h2>Recent Requests</h2>
          <Link href="/company/orders">View All →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div>
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
            <h3>No Requests Available</h3>
            <p>You currently have no moving requests.</p>
          </div>
        ) : (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div>
                        <div>{order.userId?.name || "Unknown"}</div>
                        <div>{order.userId?.email || ""}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {order.fromAddress.city} → {order.toAddress.city}
                      </div>
                    </td>
                    <td>
                      {order.confirmedDate
                        ? formatDate(order.confirmedDate)
                        : formatDate(order.preferredDates[0])}
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{formatCurrency(order.totalPrice)}</td>
                    <td>
                      <Link href={`/company/orders/${order._id}`}>Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Service Areas */}
      {company.serviceAreas && company.serviceAreas.length > 0 && (
        <div>
          <div>
            <h2>Your Service Areas</h2>
            <Link href="/company/profile">Edit →</Link>
          </div>

          <div>
            {company.serviceAreas.map((area, index) => (
              <span key={index}>
                {area.from} → {area.to}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div>
        <div>
          <h2>Tips for Your Business</h2>
        </div>

        <div>
          <Link href="/placeholder">
            <div>
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3>Respond Quickly</h3>
              <p>Answer requests within 24 hours for better ratings</p>
            </div>
          </Link>

          <Link href="/placeholder">
            <div>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3>Complete Your Profile</h3>
              <p>
                A complete profile increases your chances of getting more jobs
              </p>
            </div>
          </Link>

          <Link href="/placeholder">
            <div>
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
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <h3>Collect Reviews</h3>
              <p>Ask satisfied customers for reviews to build more trust</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
