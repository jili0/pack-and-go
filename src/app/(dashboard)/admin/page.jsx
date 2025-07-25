"use client";

import { useState, useEffect, useRef} from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";
import "@/app/styles/styles.css";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/useSocket";
import NotificationButton from "@/components/ui/NotificationButton";

export default function AdminDashboard() {
  const router = useRouter();
  const { account, loading, initialCheckDone } = useAuth();
  const dashboardLoading = useLoading("api", "dashboard");
  const deleteLoading = useLoading("api", "deleteAccount");
  const { 
    isConnected, 
    registerUser, 
    notifications, 
    clearNotifications 
  } = useSocket();
  

  const [accounts, setAccounts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const USER_ROLES = ["user", "company", "admin"];

  const registeredRef = useRef(false);
    
    useEffect(() => {
      if (isConnected && account?.id && account?.role && !registeredRef.current) {
        console.log("🔌 Registering customer user:", account.id, account.role);
        registerUser(account.id, account.role);
        registeredRef.current = true;
      }
    }, [isConnected, account?.id, account?.role, registerUser]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    dashboardLoading.startLoading();
    try {
      const [accountsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/accounts"),
        fetch("/api/orders"),
      ]);

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        accountsData.success && setAccounts(accountsData.accounts);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        ordersData.success && setOrders(ordersData.orders);
      }
    } catch (error) {
      setError("Failed to load dashboard data");
    } finally {
      dashboardLoading.stopLoading();
    }
  };

  const AccountSection = ({ role }) => {
    const filteredAccounts = accounts.filter((account) => {
      const searchLower = searchTerm?.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        account.name.toLowerCase().includes(searchLower) ||
        account.email.toLowerCase().includes(searchLower);

      const matchesRole = account.role === role;

      return matchesSearch && matchesRole;
    });

    return (
      <div>
        <h3>
          Manage {role == "company" ? "companie" : role}s (
          {filteredAccounts.length})
        </h3>

        {filteredAccounts.length === 0 ? (
          <p>
            {searchTerm
              ? `No ${role == "company" ? "companie" : role}s match your search`
              : `No ${role == "company" ? "companie" : role}s found`}
          </p>
        ) : (
          <div>
            {filteredAccounts.map((accountData) => (
              <div key={accountData._id} className="account-card">
                <p>{accountData.email}</p>
                <p>{accountData.name}</p>
                <div>
                  <button
                    className="btn-primary"
                    onClick={() => handleEditAccount(accountData._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => handleDeleteAccount(accountData._id)}
                    disabled={deleteLoading.isLoading}
                  >
                    {deleteLoading.isLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const OrderCard = ({ order, onViewOrder, formatCurrency, formatDate }) => {
    return (
      <div
        key={order._id}
        className="order-card"
        onClick={() => onViewOrder(order._id)}
      >
        <p>
          <b>ID:</b> #{order._id}
        </p>
        <p>
          <b>Customer Name:</b> {order.accountId?.name || "Unknown"}
          </p>
        <p>
          <b>From: </b>
          {order.fromAddress?.city}
        </p>
        <p>
          <b>To: </b>
          {order.toAddress?.city}
        </p>
        <p>
          <b>Total Price:</b> {formatCurrency(order.totalPrice)}
        </p>
        <p>
          <b>Created At: </b>
          {formatDate(order.createdAt)}
        </p>
      </div>
    );
  };

  const handleEditAccount = (accountId) => {
    router.push(`/admin/accounts/${accountId}`);
  };

  const handleDeleteAccount = async (accountId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account? This action cannot be undone."
    );
    if (!confirmed) return;

    deleteLoading.startLoading();
    try {
      const response = await fetch(`/api/admin/accounts/${accountId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setAccounts(accounts.filter((account) => account._id !== accountId));
      } else {
        setError(data.message || "Error deleting user");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      deleteLoading.stopLoading();
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

  if (dashboardLoading.isLoading) {
    return (
      <div className="container">
        <Loader text="Loading dashboard..." />
      </div>
    );
  }

  const totalAccounts = accounts.length;
  const customerCount = accounts.filter((u) => u.role === "user").length;
  const companyCount = accounts.filter((u) => u.role === "company").length;
  const adminCount = accounts.filter((u) => u.role === "admin").length;

  const orderStats = getOrderStats();
  const recentOrders = orders.slice(0, 15);

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}

      <div className="review-admin-link" style={{ marginTop: "1rem" }}>
          <button
            className="btn-primary"
            onClick={() => router.push("/admin/reviews")}
          >
            Moderate Reviews
          </button>
          </div>
          <NotificationButton />
      <div>
        <div className="admin-stats">
          <p>Total Accounts: {totalAccounts}</p>
          <p>Customers: {customerCount}</p>
          <p>Companies: {companyCount}</p>
          <p>Admins: {adminCount}</p>
        </div>
      <div className="order-stats">
          <p>Total Orders: {orderStats.total}</p>
          <p>Pending: {orderStats.pending}</p>
          <p>Active: {orderStats.confirmed}</p>
          <p>Completed: {orderStats.completed}</p>
        </div>

        <div className="admin-search">
          <input
            type="text"
            placeholder="Search accounts by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="btn-primary clearSearchBtn"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </button>
          )}
        </div>

        {USER_ROLES.map((role) => (
          <AccountSection key={role} role={role} />
        ))}
      </div>

      <div>
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
