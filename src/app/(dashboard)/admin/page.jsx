"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/app/styles/styles.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const USER_ROLES = ["user", "company", "admin"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/orders"),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        usersData.success && setUsers(usersData.users);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        ordersData.success && setOrders(ordersData.orders);
      }
    } catch (error) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Reusable UserSection component
  const UserSection = ({ role }) => {
    // Search and filter
    const filteredUsers = users.filter((user) => {
      const searchLower = searchTerm?.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);

      const matchesRole = user.role === role;

      return matchesSearch && matchesRole;
    });

    return (
      <div>
        <h3>
          Manage {role == "company" ? "companie" : role}s (
          {filteredUsers.length})
        </h3>

        {filteredUsers.length === 0 ? (
          <p>
            {searchTerm
              ? `No ${role == "company" ? "companie" : role}s match your search`
              : `No ${role == "company" ? "companie" : role}s found`}
          </p>
        ) : (
          <div>
            {filteredUsers.map((userData) => (
              <div key={userData._id} className="user-card">
                <div>
                  <h4>{userData.name}</h4>
                  <p>{userData.email}</p>
                </div>
                <div>
                  <button
                    className="btn-primary"
                    onClick={() => handleEditUser(userData._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => handleDeleteUser(userData._id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Reusable OrderCard component
  const OrderCard = ({ order, onViewOrder, formatCurrency, formatDate }) => {
    return (
      <div
        key={order._id}
        className="order-card"
        onClick={() => onViewOrder(order._id)}
      >
        <p>
          <b>OrderID:</b> #{order._id}
        </p>
        <p>
          <b>CustomerName:</b> {order.customerName || "Unknown"}
        </p>
        <p>
          <b>From:</b> {order.fromAddress?.city} <b>To: </b>
          {order.toAddress?.city}
        </p>
        <p>
          <b>TotalPrice:</b> {formatCurrency(order.totalPrice)}
        </p>
        <p>
          <b>CreatedAt: </b>
          {formatDate(order.createdAt)}
        </p>
      </div>
    );
  };

  const handleEditUser = (userId) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId) => {
    // confirm delete
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        setError(data.message || "Error deleting user");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getOrderStats = () => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return {
      total: orders.length,
      pending: statusCounts.pending || 0,
      confirmed: statusCounts.confirmed || 0,
      completed: statusCounts.completed || 0,
      cancelled: statusCounts.cancelled || 0,
      totalRevenue,
    };
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  // Calculate user statistics directly
  const totalUsers = users.length;
  const customerCount = users.filter((u) => u.role === "user").length;
  const companyCount = users.filter((u) => u.role === "company").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const orderStats = getOrderStats();
  const recentOrders = orders.slice(0, 15);

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}

      <div>
        <div className="admin-stats">
          <p>Total Accounts: {totalUsers}</p>
          <p>Customers: {customerCount}</p>
          <p>Companies: {companyCount}</p>
          <p>Admins: {adminCount}</p>
        </div>

        <div className="admin-search">
          <input
            type="text"
            placeholder="Search accounts by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")}>Clear</button>
          )}
        </div>

        {/* User Management Sections */}
        {USER_ROLES.map((role) => (
          <UserSection key={role} role={role} />
        ))}
      </div>

      {/* Order Management Section */}
      <div>
        <h2>Order Management</h2>
        <div className="order-stats">
          <p>Total Orders: {orderStats.total}</p>
          <p>Pending: {orderStats.pending}</p>
          <p>Active: {orderStats.confirmed}</p>
          <p>Completed: {orderStats.completed}</p>
        </div>

        <Link href="/admin/orders">Manage All Orders</Link>

        <h3>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <div>
            {recentOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onViewOrder={handleViewOrder}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
