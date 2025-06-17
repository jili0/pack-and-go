"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// User management configuration
const USER_ROLES = {
  user: { label: "Customers", searchEmpty: "No customers" },
  company: { label: "Companies", searchEmpty: "No companies" },
  admin: { label: "Admins", searchEmpty: "No administrators" }
};

// Reusable UserSection component
const UserSection = ({ 
  role, 
  users, 
  searchTerm, 
  onEditUser, 
  onDeleteUser 
}) => {
  const config = USER_ROLES[role];
  const filteredUsers = users.filter(user => {
    if (user.role !== role) return false;
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(searchLower) || 
           user.email.toLowerCase().includes(searchLower);
  });

  return (
    <div>
      <div>
        <h3>Manage {config.label} ({filteredUsers.length})</h3>
      </div>
      {filteredUsers.length === 0 ? (
        <div>
          <p>
            {searchTerm
              ? `${config.searchEmpty} match your search`
              : `${config.searchEmpty} found`}
          </p>
        </div>
      ) : (
        <div>
          {filteredUsers.map((userData) => (
            <div key={userData._id}>
              <h4>{userData.name}</h4>
              <p>{userData.email}</p>
              <button
                className="btn-primary"
                onClick={() => onEditUser(userData._id)}
              >
                Edit
              </button>
              <button
                className="btn-primary"
                onClick={() => onDeleteUser(userData._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Reusable OrderCard component
const OrderCard = ({ order, onViewOrder, formatCurrency, formatDate }) => (
  <div key={order._id} onClick={() => onViewOrder(order._id)}>
    <p>OrderID: #{order._id}</p>
    <p>CustomerName: {order.customerName || "Unknown"}</p>
    <p>From: {order.fromAddress?.city}</p>
    <p>To: {order.toAddress?.city}</p>
    <p>TotalPrice: {formatCurrency(order.totalPrice)}</p>
    <p>CreatedAt: {formatDate(order.createdAt)}</p>
  </div>
);

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
      const [usersRes, ordersRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/orders")
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

  const handleUserAction = async (userId, action) => {
    if (action === "delete") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      );
      if (!confirmed) return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: action === "delete" ? undefined : JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        if (action === "delete") {
          setUsers(users.filter((user) => user._id !== userId));
        } else {
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
      setError("An error occurred. Please try again later.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = (userId) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleDeleteUser = (userId) => {
    handleUserAction(userId, "delete");
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

  const getUserStats = () => {
    const customers = users.filter((u) => u.role === "user").length;
    const companies = users.filter((u) => u.role === "company").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total: users.length, customers, companies, admins };
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

  const userStats = getUserStats();
  const orderStats = getOrderStats();
  const recentOrders = orders.slice(0, 15);

  return (
    <div>
      {error && <p className="error">{error}</p>}
      
      {/* User Statistics */}
      <div>
        <div>
          <p>Total Accounts: {userStats.total}</p>
          <p>Customers: {userStats.customers}</p>
          <p>Companies: {userStats.companies}</p>
          <p>Admins: {userStats.admins}</p>
        </div>

        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="Search accounts by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button onClick={() => setSearchTerm("")}>×</button>}
        </div>

        {/* User Management Sections */}
        {Object.keys(USER_ROLES).map(role => (
          <UserSection
            key={role}
            role={role}
            users={users}
            searchTerm={searchTerm}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        ))}
      </div>

      {/* Order Management Section */}
      <div>
        <h2>Order Management</h2>
        <div>
          <p>Total Orders: {orderStats.total}</p>
          <p>Pending: {orderStats.pending}</p>
          <p>Active: {orderStats.confirmed}</p>
          <p>Completed: {orderStats.completed}</p>
          <Link href="/admin/orders">Manage All Orders</Link>
        </div>

        <div>
          <h3>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <div>
              <p>No orders found</p>
            </div>
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
    </div>
  );
}