// src/components/dashboard/OrderDetails.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Image from "@/components/ui/Image";

const OrderDetails = ({ orderId }) => {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (data.success) {
          setOrder(data.order);
          setCompany(data.company);
        } else {
          setError(data.message || "Failed to load order details.");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return "No date specified";

    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: styles.badgeYellow, text: "Request Sent" },
      confirmed: { class: styles.badgeGreen, text: "Confirmed" },
      declined: { class: styles.badgeRed, text: "Declined" },
      completed: { class: styles.badgeBlue, text: "Completed" },
      cancelled: { class: styles.badgeGray, text: "Cancelled" },
    };

    const statusInfo = statusMap[status] || {
      class: styles.badgeGray,
      text: status,
    };

    return <span>{statusInfo.text}</span>;
  };

  const handleCancelOrder = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setShowCancelModal(false);
      } else {
        setError(data.message || "Failed to cancel order.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => router.push("/user/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order || !company) {
    return (
      <div>
        <h3>Order Not Found</h3>
        <p>The requested order could not be found.</p>
        <button onClick={() => router.push("/user/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <div>
            <h2>Order Details</h2>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div>
          {/* Order ID and Date */}
          <div>
            <div>
              <span>Order ID:</span>
              <span>{order._id}</span>
            </div>
            <div>
              <span>Order Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Moving Company */}
          <div>
            <h3>Moving Company</h3>
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
                <h4>{company.companyName}</h4>
                <div>
                  <div>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.round(company.averageRating)
                            ? styles.starFilled
                            : styles.starEmpty
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span>
                    ({company.reviewsCount}{" "}
                    {company.reviewsCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
                {company.isKisteKlarCertified && <div>KisteKlar Certified</div>}
              </div>
            </div>
          </div>

          {/* Moving Details */}
          <div>
            <h3>Moving Details</h3>
            <div>
              <div>
                <h4>From</h4>
                <p>{order.fromAddress.street}</p>
                <p>
                  {order.fromAddress.postalCode} {order.fromAddress.city}
                </p>
                <p>{order.fromAddress.country}</p>
              </div>
              <div>→</div>
              <div>
                <h4>To</h4>
                <p>{order.toAddress.street}</p>
                <p>
                  {order.toAddress.postalCode} {order.toAddress.city}
                </p>
                <p>{order.toAddress.country}</p>
              </div>
            </div>

            <div>
              <div>
                <span>Moving Date:</span>
                <span>
                  {order.confirmedDate ? (
                    formatDate(order.confirmedDate)
                  ) : (
                    <>
                      <span>
                        Preferred: {formatDate(order.preferredDates[0])}
                      </span>
                      <small>(Waiting for confirmation)</small>
                    </>
                  )}
                </span>
              </div>

              <div>
                <span>Helpers:</span>
                <span>{order.helpersCount}</span>
              </div>

              <div>
                <span>Estimated Hours:</span>
                <span>{order.estimatedHours}</span>
              </div>

              <div>
                <span>Total Price:</span>
                <span>{order.totalPrice} €</span>
              </div>
            </div>

            {order.notes && (
              <div>
                <h4>Additional Notes</h4>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div>
            <button onClick={() => router.back()}>Back</button>

            {order.status === "pending" && (
              <button onClick={() => setShowCancelModal(true)}>
                Cancel Order
              </button>
            )}

            {order.status === "completed" && !order.review && (
              <button
                onClick={() => router.push(`/user/orders/${orderId}/review`)}
              >
                Leave Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div>
          <div>
            <div>
              <h3>Cancel Order</h3>
            </div>
            <div>
              <p>Are you sure you want to cancel this order?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div>
              <button onClick={() => setShowCancelModal(false)}>
                No, Keep Order
              </button>
              <button onClick={handleCancelOrder} disabled={loading}>
                {loading ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
