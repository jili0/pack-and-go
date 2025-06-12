"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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
        confirmedDate: order.confirmedDate
          ? new Date(order.confirmedDate).toISOString().split("T")[0]
          : "",
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
    if (
      !window.confirm(
        `Are you sure you want to change the status to ${newStatus}?`
      )
    ) {
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
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
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
      <div>
        <div></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <h1>Order Not Found</h1>
        <p>
          The order you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link href="/admin">← Back to Dashboard</Link>
      </div>
    );
  }

  const statusInfo = getStatusBadge(order.status);

  return (
    <div>
      {/* Header */}
      <div>
        <div>
          <div>
            <h1>Order #{order._id.slice(-8)}</h1>
            <span className={statusInfo.class}>{statusInfo.text}</span>
          </div>
          <div>
            <Link href="/admin/orders">← Back to Orders</Link>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div>
          <div>✓</div>
          <div>{success}</div>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {error && (
        <div>
          <div>⚠</div>
          <div>{error}</div>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3>Quick Actions</h3>
        <div>
          {order.status === "pending" && (
            <>
              <button
                onClick={() => handleStatusUpdate("confirmed")}
                disabled={saving}
              >
                Confirm Order
              </button>
              <button
                onClick={() => handleStatusUpdate("declined")}
                disabled={saving}
              >
                Decline Order
              </button>
            </>
          )}

          {order.status === "confirmed" && (
            <button
              onClick={() => handleStatusUpdate("completed")}
              disabled={saving}
            >
              Mark as Completed
            </button>
          )}

          <button onClick={() => setIsEditing(!isEditing)} disabled={saving}>
            {isEditing ? "Cancel Edit" : "Edit Order"}
          </button>

          <button onClick={handleDeleteOrder} disabled={saving}>
            Delete Order
          </button>
        </div>
      </div>

      {/* Order Details */}
      <div>
        {/* Basic Information */}
        <div>
          <h3>Basic Information</h3>
          <div>
            <div>
              <label>Order ID</label>
              <span>#{order._id}</span>
            </div>
            <div>
              <label>Customer</label>
              <span>{order.customerName || "Unknown Customer"}</span>
            </div>
            <div>
              <label>Status</label>
              {isEditing ? (
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
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
            <div>
              <label>Created</label>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div>
              <label>Last Updated</label>
              <span>{formatDate(order.updatedAt)}</span>
            </div>
            <div>
              <label>Confirmed Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.confirmedDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, confirmedDate: e.target.value })
                  }
                />
              ) : (
                <span>{formatDate(order.confirmedDate)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3>Address Information</h3>
          <div>
            <div>
              <h4>From Address</h4>
              <div>
                <p>{order.fromAddress?.street}</p>
                <p>
                  {order.fromAddress?.postalCode} {order.fromAddress?.city}
                </p>
                <p>{order.fromAddress?.country}</p>
              </div>
            </div>
            <div>
              <h4>To Address</h4>
              <div>
                <p>{order.toAddress?.street}</p>
                <p>
                  {order.toAddress?.postalCode} {order.toAddress?.city}
                </p>
                <p>{order.toAddress?.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div>
          <h3>Service Details</h3>
          <div>
            <div>
              <label>Number of Helpers</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  value={editForm.helpersCount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, helpersCount: e.target.value })
                  }
                />
              ) : (
                <span>{order.helpersCount}</span>
              )}
            </div>
            <div>
              <label>Estimated Hours</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  value={editForm.estimatedHours}
                  onChange={(e) =>
                    setEditForm({ ...editForm, estimatedHours: e.target.value })
                  }
                />
              ) : (
                <span>{order.estimatedHours}</span>
              )}
            </div>
            <div>
              <label>Total Price</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.totalPrice}
                  onChange={(e) =>
                    setEditForm({ ...editForm, totalPrice: e.target.value })
                  }
                />
              ) : (
                <span>{formatCurrency(order.totalPrice)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Preferred Dates */}
        <div>
          <h3>Preferred Dates</h3>
          <div>
            {order.preferredDates && order.preferredDates.length > 0 ? (
              order.preferredDates.map((date, index) => (
                <div key={index}>{formatDate(date)}</div>
              ))
            ) : (
              <p>No preferred dates specified</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3>Notes</h3>
          {isEditing ? (
            <textarea
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
              placeholder="Add notes about this order..."
              maxLength={500}
            />
          ) : (
            <div>
              {order.notes ? <p>{order.notes}</p> : <p>No notes added</p>}
            </div>
          )}
        </div>
      </div>

      {/* Save Changes Button */}
      {isEditing && (
        <div>
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button onClick={() => setIsEditing(false)} disabled={saving}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
