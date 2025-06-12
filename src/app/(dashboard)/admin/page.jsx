"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsers(usersData.users);
        }
      }

      // Fetch orders
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.orders);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    if (action === "delete") {
      if (
        !window.confirm(
          "Are you sure you want to delete this user? This action cannot be undone."
        )
      ) {
        return;
      }
    }

    try {
      setActionLoading(true);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: action !== "delete" ? JSON.stringify({ action }) : undefined,
      });

      const data = await response.json();

      if (data.success) {
        if (action === "delete") {
          // Remove user from the list
          setUsers(users.filter((user) => user._id !== userId));
        } else {
          // Update user in the list
          setUsers(
            users.map((user) =>
              user._id === userId ? { ...user, ...data.user } : user
            )
          );
        }
      } else {
        setError(data.message || `Error performing ${action} action`);
      }
    } catch (error) {
      console.error("Error with user action:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = (userId) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleViewOrder = (orderId) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const getFilteredUsers = (role) => {
    let filtered = users.filter((u) => u.role === role);

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.slice(0, 5); // Show max 5 items
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      user: {
        class: `${styles.roleBadge} ${styles.roleUser}`,
        text: "Customer",
      },
      company: {
        class: `${styles.roleBadge} ${styles.roleCompany}`,
        text: "Company",
      },
      admin: {
        class: `${styles.roleBadge} ${styles.roleAdmin}`,
        text: "Admin",
      },
    };
    const roleInfo = roleMap[role] || { class: styles.roleBadge, text: role };
    return <span className={roleInfo.class}>{roleInfo.text}</span>;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        class: `${styles.statusBadge} ${styles.statusPending}`,
        text: "Pending",
      },
      confirmed: {
        class: `${styles.statusBadge} ${styles.statusConfirmed}`,
        text: "Confirmed",
      },
      declined: {
        class: `${styles.statusBadge} ${styles.statusDeclined}`,
        text: "Declined",
      },
      completed: {
        class: `${styles.statusBadge} ${styles.statusCompleted}`,
        text: "Completed",
      },
      cancelled: {
        class: `${styles.statusBadge} ${styles.statusCancelled}`,
        text: "Cancelled",
      },
    };
    const statusInfo = statusMap[status] || {
      class: styles.statusBadge,
      text: status,
    };
    return <span className={statusInfo.class}>{statusInfo.text}</span>;
  };

  const getUserStats = () => {
    const customers = users.filter((u) => u.role === "user").length;
    const companies = users.filter((u) => u.role === "company").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total: users.length, customers, companies, admins };
  };

  const getOrderStats = () => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const confirmed = orders.filter((o) => o.status === "confirmed").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return {
      total: orders.length,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue,
    };
  };

  const userStats = getUserStats();
  const orderStats = getOrderStats();
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div>
        <div></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
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
      )}

      {/* User Management Section */}
      <div>
        <div>
          <h2>User & Account Management</h2>
        </div>

        {/* User Statistics */}
        <div>
          <div>
            <h3>Total Users</h3>
            <p>{userStats.total}</p>
            <p>All registered accounts</p>
          </div>
          <div>
            <h3>Customers</h3>
            <p>{userStats.customers}</p>
            <p>Regular users</p>
          </div>
          <div>
            <h3>Companies</h3>
            <p>{userStats.companies}</p>
            <p>Business accounts</p>
          </div>
          <div>
            <h3>Admins</h3>
            <p>{userStats.admins}</p>
            <p>Administrator accounts</p>
          </div>
        </div>

        {/* Search Function */}
        <div>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search accounts by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && setSearchTerm(e.target.value)
              }
            />
            {searchTerm && <button onClick={() => setSearchTerm("")}>×</button>}
            <button
              onClick={() => {
                /* Search is live, but this provides visual feedback */
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Manage Customers */}
        <div>
          <div>
            <h3>Manage Customers ({getFilteredUsers("user").length})</h3>
          </div>
          {getFilteredUsers("user").length === 0 ? (
            <div>
              <p>
                {searchTerm
                  ? "No customers match your search"
                  : "No customers found"}
              </p>
            </div>
          ) : (
            <div>
              {getFilteredUsers("user").map((userData) => (
                <div key={userData._id}>
                  <div>
                    <div>
                      <span>{userData.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4>{userData.name}</h4>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  <div>
                    <div>
                      {getRoleBadge(userData.role)}
                      <span>{formatDate(userData.createdAt)}</span>
                    </div>
                    <div>
                      <button
                        onClick={() => handleEditUser(userData._id)}
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserAction(userData._id, "delete")}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manage Companies */}
        <div>
          <div>
            <h3>Manage Companies ({getFilteredUsers("company").length})</h3>
          </div>
          {getFilteredUsers("company").length === 0 ? (
            <div>
              <p>
                {searchTerm
                  ? "No companies match your search"
                  : "No companies found"}
              </p>
            </div>
          ) : (
            <div>
              {getFilteredUsers("company").map((userData) => (
                <div key={userData._id}>
                  <div>
                    <div>
                      <span>{userData.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4>{userData.name}</h4>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  <div>
                    <div>
                      {getRoleBadge(userData.role)}
                      <span>{formatDate(userData.createdAt)}</span>
                    </div>
                    <div>
                      <button
                        onClick={() => handleEditUser(userData._id)}
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserAction(userData._id, "delete")}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manage Admins */}
        <div>
          <div>
            <h3>Manage Admins ({getFilteredUsers("admin").length})</h3>
          </div>
          {getFilteredUsers("admin").length === 0 ? (
            <div>
              <p>
                {searchTerm
                  ? "No administrators match your search"
                  : "No administrators found"}
              </p>
            </div>
          ) : (
            <div>
              {getFilteredUsers("admin").map((userData) => (
                <div key={userData._id}>
                  <div>
                    <div>
                      <span>{userData.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4>{userData.name}</h4>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  <div>
                    <div>
                      {getRoleBadge(userData.role)}
                      <span>{formatDate(userData.createdAt)}</span>
                    </div>
                    <div>
                      <button
                        onClick={() => handleEditUser(userData._id)}
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserAction(userData._id, "delete")}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Management Section */}
      <div>
        <div>
          <h2>Order Management</h2>
          <Link href="/admin/orders">Manage All Orders →</Link>
        </div>

        {/* Order Statistics */}
        <div>
          <div>
            <h3>Total Orders</h3>
            <p>{orderStats.total}</p>
            <p>All platform orders</p>
          </div>
          <div>
            <h3>Pending</h3>
            <p>{orderStats.pending}</p>
            <p>Awaiting response</p>
          </div>
          <div>
            <h3>Active</h3>
            <p>{orderStats.confirmed}</p>
            <p>Confirmed orders</p>
          </div>
          <div>
            <h3>Completed</h3>
            <p>{orderStats.completed}</p>
            <p>Finished moves</p>
          </div>
        </div>

        {/* Recent Orders Preview */}
        <div>
          <h3>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <div>
              <p>No orders found</p>
            </div>
          ) : (
            <div>
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className={`${styles.dataRow} ${styles.clickableRow}`}
                  onClick={() => handleViewOrder(order._id)}
                >
                  <div>
                    <div>
                      <span>#{order._id.slice(-8)}</span>
                      <span>{order.customerName || "Unknown"}</span>
                    </div>
                    <div>
                      <span>{order.fromAddress?.city}</span>
                      <span>→</span>
                      <span>{order.toAddress?.city}</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                    <span>{formatCurrency(order.totalPrice)}</span>
                    <span>{formatDate(order.createdAt)}</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
