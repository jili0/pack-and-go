"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/styles/OrderDetail.module.css";

export default function OrderDetail() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states for editing
  const [editForm, setEditForm] = useState({
    status: "",
    notes: "",
    helpersCount: "",
    estimatedHours: "",
    totalPrice: "",
    confirmedDate: "",
  });

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || "Failed to fetch order");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  useEffect(() => {
    if (order) {
      setEditForm({
        status: order.status || "",
        notes: order.notes || "",
        helpersCount: order.helpersCount || "",
        estimatedHours: order.estimatedHours || "",
        totalPrice: order.totalPrice || "",
        confirmedDate: order.confirmedDate ? 
          new Date(order.confirmedDate).toISOString().split('T')[0] : "",
      });
    }
  }, [order]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        status: editForm.status,
        notes: editForm.notes,
        helpersCount: parseInt(editForm.helpersCount),
        estimatedHours: parseInt(editForm.estimatedHours),
        totalPrice: parseFloat(editForm.totalPrice),
        confirmedDate: editForm.confirmedDate || null,
      };

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setIsEditing(false);
        setSuccess("Order updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setError("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setSuccess(`Order status updated to ${newStatus}!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/orders");
      } else {
        setError(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      setError("Failed to delete order");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
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
    return statusMap[status] || { class: styles.statusBadge, text: status };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.errorContainer}>
        <h1>Order Not Found</h1>
        <p>The order you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusBadge(order.status);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerMain}>
            <h1 className={styles.title}>Order #{order._id.slice(-8)}</h1>
            <span className={statusInfo.class}>{statusInfo.text}</span>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/orders" className={styles.backLink}>
              ← Back to Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className={styles.successAlert}>
          <div className={styles.successIcon}>✓</div>
          <div className={styles.successText}>{success}</div>
          <button onClick={() => setSuccess(null)} className={styles.closeAlert}>×</button>
        </div>
      )}

      {error && (
        <div className={styles.errorAlert}>
          <div className={styles.errorIcon}>⚠</div>
          <div className={styles.errorText}>{error}</div>
          <button onClick={() => setError(null)} className={styles.closeAlert}>×</button>
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionButtons}>
          {order.status === "pending" && (
            <>
              <button
                onClick={() => handleStatusUpdate("confirmed")}
                className={styles.confirmButton}
                disabled={saving}
              >
                Confirm Order
              </button>
              <button
                onClick={() => handleStatusUpdate("declined")}
                className={styles.declineButton}
                disabled={saving}
              >
                Decline Order
              </button>
            </>
          )}
          
          {order.status === "confirmed" && (
            <button
              onClick={() => handleStatusUpdate("completed")}
              className={styles.completeButton}
              disabled={saving}
            >
              Mark as Completed
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={styles.editButton}
            disabled={saving}
          >
            {isEditing ? "Cancel Edit" : "Edit Order"}
          </button>

          <button
            onClick={handleDeleteOrder}
            className={styles.deleteButton}
            disabled={saving}
          >
            Delete Order
          </button>
        </div>
      </div>

      {/* Order Details */}
      <div className={styles.contentGrid}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Order ID</label>
              <span>#{order._id}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Customer</label>
              <span>{order.customerName || "Unknown Customer"}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Status</label>
              {isEditing ? (
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className={styles.editInput}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              ) : (
                <span className={statusInfo.class}>{statusInfo.text}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <label>Created</label>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Last Updated</label>
              <span>{formatDate(order.updatedAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Confirmed Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.confirmedDate}
                  onChange={(e) => setEditForm({...editForm, confirmedDate: e.target.value})}
                  className={styles.editInput}
                />
              ) : (
                <span>{formatDate(order.confirmedDate)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Address Information</h3>
          <div className={styles.addressGrid}>
            <div className={styles.addressCard}>
              <h4>From Address</h4>
              <div className={styles.address}>
                <p>{order.fromAddress?.street}</p>
                <p>{order.fromAddress?.postalCode} {order.fromAddress?.city}</p>
                <p>{order.fromAddress?.country}</p>
              </div>
            </div>
            <div className={styles.addressCard}>
              <h4>To Address</h4>
              <div className={styles.address}>
                <p>{order.toAddress?.street}</p>
                <p>{order.toAddress?.postalCode} {order.toAddress?.city}</p>
                <p>{order.toAddress?.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Service Details</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Number of Helpers</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  value={editForm.helpersCount}
                  onChange={(e) => setEditForm({...editForm, helpersCount: e.target.value})}
                  className={styles.editInput}
                />
              ) : (
                <span>{order.helpersCount}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <label>Estimated Hours</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  value={editForm.estimatedHours}
                  onChange={(e) => setEditForm({...editForm, estimatedHours: e.target.value})}
                  className={styles.editInput}
                />
              ) : (
                <span>{order.estimatedHours}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <label>Total Price</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.totalPrice}
                  onChange={(e) => setEditForm({...editForm, totalPrice: e.target.value})}
                  className={styles.editInput}
                />
              ) : (
                <span className={styles.priceValue}>{formatCurrency(order.totalPrice)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Preferred Dates */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Preferred Dates</h3>
          <div className={styles.datesList}>
            {order.preferredDates && order.preferredDates.length > 0 ? (
              order.preferredDates.map((date, index) => (
                <div key={index} className={styles.dateItem}>
                  {formatDate(date)}
                </div>
              ))
            ) : (
              <p className={styles.noData}>No preferred dates specified</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Notes</h3>
          {isEditing ? (
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
              className={styles.editTextarea}
              placeholder="Add notes about this order..."
              maxLength={500}
            />
          ) : (
            <div className={styles.notesContent}>
              {order.notes ? (
                <p>{order.notes}</p>
              ) : (
                <p className={styles.noData}>No notes added</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Changes Button */}
      {isEditing && (
        <div className={styles.saveSection}>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={styles.cancelButton}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}