"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import "@/app/styles/styles.css";

export default function OrderDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((data) =>
        data.success ? setOrder(data.order) : setMessage("Order not found")
      )
      .catch(() => setMessage("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const update = async (data) => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.success) {
      setOrder(result.order);
      setMessage("Updated!");
      setTimeout(() => setMessage(""), 2000);
    }
    setSaving(false);
  };

  const deleteOrder = async () => {
    if (!confirm("Delete order?")) return;
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    const data = await res.json();
    data.success ? router.push("/admin/orders") : setMessage("Delete failed");
  };

  if (loading) return <p>Loading...</p>;
  if (!order)
    return (
      <div>
        <h1>Order Not Found</h1>
        <Link href="/admin">← Back</Link>
      </div>
    );

  return (
    <div className="container">
      <h1>
        Order #{order._id.slice(-8)} - {order.status}
      </h1>
      <Link href="/admin/orders">Back to Orders</Link>

      {message && <p>{message}</p>}

      {/* Buttons */}
      <div>
        {order.status === "pending" && (
          <>
            <button
              className="btn-primary"
              onClick={() => update({ status: "confirmed" })}
            >
              Confirm
            </button>
            <button
              className="btn-primary"
              onClick={() => update({ status: "declined" })}
            >
              Decline
            </button>
          </>
        )}
        {order.status === "confirmed" && (
          <button
            className="btn-primary"
            onClick={() => update({ status: "completed" })}
          >
            Complete
          </button>
        )}
        <button className="btn-primary" onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "Edit"}
        </button>
        <button className="btn-primary" onClick={deleteOrder}>
          Delete
        </button>
        {editing && (
          <button
            className="btn-primary"
            onClick={() => {
              update(order);
              setEditing(false);
            }}
          >
            Save
          </button>
        )}
      </div>
      <div className="order-detail">
        <p>
          <strong>Customer:</strong>
          {editing ? (
            <input
              value={order.customerName || ""}
              onChange={(e) =>
                setOrder({ ...order, customerName: e.target.value })
              }
            />
          ) : (
            order.customerName
          )}
        </p>

        <p>
          <strong>From:</strong>
          {editing ? (
            <input
              value={order.fromAddress?.street || ""}
              onChange={(e) =>
                setOrder({
                  ...order,
                  fromAddress: { ...order.fromAddress, street: e.target.value },
                })
              }
            />
          ) : (
            `${order.fromAddress?.street}, ${order.fromAddress?.city}`
          )}
        </p>
        <p>
          <strong>To:</strong>
          {editing ? (
            <input
              value={order.toAddress?.street || ""}
              onChange={(e) =>
                setOrder({
                  ...order,
                  toAddress: { ...order.toAddress, street: e.target.value },
                })
              }
            />
          ) : (
            `${order.toAddress?.street}, ${order.toAddress?.city}`
          )}
        </p>

        <p>
          <strong>Helpers:</strong>
          {editing ? (
            <input
              type="number"
              value={order.helpersCount || ""}
              onChange={(e) =>
                setOrder({ ...order, helpersCount: e.target.value })
              }
            />
          ) : (
            order.helpersCount
          )}
        </p>

        <p>
          <strong>Hours:</strong>
          {editing ? (
            <input
              type="number"
              value={order.estimatedHours || ""}
              onChange={(e) =>
                setOrder({ ...order, estimatedHours: e.target.value })
              }
            />
          ) : (
            order.estimatedHours
          )}
        </p>

        <p>
          <strong>Notes:</strong>
        </p>
        {editing ? (
          <textarea
            value={order.notes || ""}
            onChange={(e) => setOrder({ ...order, notes: e.target.value })}
          />
        ) : (
          <p>{order.notes || "No notes"}</p>
        )}

        <p>
          <strong>Created:</strong>{" "}
          {new Date(order.createdAt).toLocaleDateString("de-DE")}
        </p>
      </div>
    </div>
  );
}
