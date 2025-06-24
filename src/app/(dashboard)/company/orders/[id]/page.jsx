"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const STATUS_COLORS = {
  pending: "status-pending",
  confirmed: "status-confirmed", 
  completed: "status-completed",
  cancelled: "status-cancelled"
};

const FILTER_OPTIONS = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function CompanyOrders() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedDates, setSelectedDates] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!authLoading && (!account || account.role !== "company")) {
      router.push("/login");
      return;
    }
    if (!authLoading && account) fetchOrders();
  }, [account, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      
      if (!response.ok) throw new Error("Error loading orders");
      
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.orders);
      } else {
        setError(result.message || "Error loading orders");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Error loading orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId, updates) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success) {
        setOrders(prev => prev.map(order =>
          order._id === orderId ? { ...order, ...updates } : order
        ));
        
        // Clear selected date if confirming with date
        if (updates.confirmedDate) {
          setSelectedDates(prev => {
            const updated = { ...prev };
            delete updated[orderId];
            return updated;
          });
        }
      } else {
        alert(result.message || "Error updating order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order. Please try again.");
    }
  };

  const handleConfirmWithDate = (orderId) => {
    const selectedDate = selectedDates[orderId];
    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }
    updateOrder(orderId, { status: "confirmed", confirmedDate: selectedDate });
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  const filteredOrders = orders.filter(order => 
    filter === "all" || order.status === filter
  );

  const orderStats = FILTER_OPTIONS.reduce((stats, status) => {
    stats[status] = status === "all" ? orders.length : orders.filter(o => o.status === status).length;
    return stats;
  }, {});

  if (authLoading || loading) {
    return <div className="container"><p>Loading orders...</p></div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const renderOrderActions = (order) => {
    if (order.status === "pending") {
      return (
        <>
          {order.preferredDates?.length > 0 ? (
            <div className="date-selection-group">
              <div className="date-selection">
                <label>Select moving date:</label>
                <select 
                  value={selectedDates[order._id] || ""}
                  onChange={(e) => setSelectedDates(prev => ({...prev, [order._id]: e.target.value}))}
                >
                  <option value="">Choose a date</option>
                  {order.preferredDates.map((date, index) => (
                    <option key={index} value={date}>{formatDate(date)}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handleConfirmWithDate(order._id)}
                className="btn-success"
                disabled={!selectedDates[order._id]}
              >
                Confirm with Selected Date
              </button>
            </div>
          ) : (
            <button
              onClick={() => updateOrder(order._id, { status: "confirmed" })}
              className="btn-success"
            >
              Confirm Order
            </button>
          )}
          <button
            onClick={() => updateOrder(order._id, { status: "cancelled" })}
            className="btn-danger"
          >
            Decline Order
          </button>
        </>
      );
    }
    
    if (order.status === "confirmed") {
      return (
        <button
          onClick={() => updateOrder(order._id, { status: "completed" })}
          className="btn-success"
        >
          Mark as Completed
        </button>
      );
    }
    
    return null;
  };

  const Modal = ({ order, onClose }) => (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white', padding: '20px', borderRadius: '8px',
          maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Order Details #{order._id.slice(-6)}</h2>
          <button onClick={onClose} style={{ fontSize: '24px', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
        </div>
        
        <div>
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> {order.accountId?.name || "Unknown"}</p>
          <p><strong>Email:</strong> {order.accountId?.email || "N/A"}</p>
          <p><strong>Phone:</strong> {order.accountId?.phone || "N/A"}</p>
          
          <h3>Moving Details</h3>
          <p><strong>From:</strong> {order.fromAddress?.street}, {order.fromAddress?.city} {order.fromAddress?.postalCode}</p>
          <p><strong>To:</strong> {order.toAddress?.street}, {order.toAddress?.city} {order.toAddress?.postalCode}</p>
          
          <h3>Pricing</h3>
          <p><strong>Total Price:</strong> {formatCurrency(order.totalPrice)}</p>
          
          {order.selectedServices?.length > 0 && (
            <div>
              <strong>Selected Services:</strong>
              <ul>{order.selectedServices.map((service, index) => <li key={index}>{service}</li>)}</ul>
            </div>
          )}
          
          <h3>Dates & Status</h3>
          <p><strong>Status:</strong> {order.status.toUpperCase()}</p>
          <p><strong>Order Created:</strong> {formatDate(order.createdAt)}</p>
          {order.confirmedDate && <p><strong>Confirmed Date:</strong> {formatDate(order.confirmedDate)}</p>}
          {order.preferredDates?.length > 0 && (
            <div>
              <p><strong>Customer's Preferred Dates:</strong></p>
              <ul>{order.preferredDates.map((date, index) => <li key={index}>{formatDate(date)}</li>)}</ul>
            </div>
          )}
          
          {order.notes && (
            <div>
              <h3>Notes</h3>
              <p>{order.notes}</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Manage Orders</h1>
          <p>View and manage all your moving requests</p>
        </div>
        <Link href="/company" className="btn-secondary">← Back to Dashboard</Link>
      </div>

      {/* Statistics */}
      <div className="admin-stats">
        {[
          { label: "Total Orders", key: "all" },
          { label: "Pending", key: "pending" },
          { label: "Confirmed", key: "confirmed" },
          { label: "Completed", key: "completed" }
        ].map(({ label, key }) => (
          <div key={key}>
            <h3>{label}</h3>
            <p>{orderStats[key]}</p>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {FILTER_OPTIONS.map(option => (
          <button 
            key={option}
            className={filter === option ? "btn-primary" : "btn-secondary"}
            onClick={() => setFilter(option)}
          >
            {option === "all" ? "All" : option.charAt(0).toUpperCase() + option.slice(1)} ({orderStats[option]})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No Orders Found</h3>
            <p>{filter === "all" ? "You currently have no moving requests." : `No ${filter} orders found.`}</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <span className={`status-badge ${STATUS_COLORS[order.status]}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="order-date">
                  <small>Request created: {formatDate(order.createdAt)}</small>
                </div>
              </div>

              <div className="order-details">
                <div className="detail-row"><strong>Customer:</strong> {order.accountId?.name || "Unknown"}</div>
                <div className="detail-row"><strong>Email:</strong> {order.accountId?.email || "N/A"}</div>
                <div className="detail-row"><strong>Route:</strong> {order.fromAddress?.city} → {order.toAddress?.city}</div>
                <div className="detail-row">
                  <strong>Moving Date:</strong>{" "}
                  {order.confirmedDate ? (
                    <span className="confirmed-date">Confirmed: {formatDate(order.confirmedDate)}</span>
                  ) : order.preferredDates?.length > 0 ? (
                    <div className="preferred-dates">
                      <div>Customer's preferred dates:</div>
                      <ul>
                        {order.preferredDates.map((date, index) => (
                          <li key={index}>Option {index + 1}: {formatDate(date)}</li>
                        ))}
                      </ul>
                    </div>
                  ) : "Not specified"}
                </div>
                <div className="detail-row"><strong>Price:</strong> {formatCurrency(order.totalPrice)}</div>
              </div>

              <div className="order-actions">
                {renderOrderActions(order)}
                <button onClick={() => setSelectedOrder(order)} className="btn-primary">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && <Modal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}