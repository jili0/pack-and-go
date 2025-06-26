"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";
import Link from "next/link";
import Image from "@/components/ui/Image";

export default function OrderConfirmation() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { account } = useAuth();
  const orderLoading = useLoading('api', 'orderConfirmation');

  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!account) {
      router.push("/login");
      return;
    }

    const fetchOrderDetails = async () => {
      orderLoading.startLoading();
      try {
        const response = await fetch(`/api/orders/${id}`);
        const data = await response.json();

        if (data.success) {
          setOrder(data.order);
          setCompany(data.company);
        } else {
          setError(data.message || "The order details could not be loaded.");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("An error occurred. Please try again later.");
      } finally {
        orderLoading.stopLoading();
      }
    };

    fetchOrderDetails();
  }, [id, account, router]);

  const formatDate = (dateString) => {
    if (!dateString) return "No date specified";

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (orderLoading.isLoading) {
    return (
      <div>
        <Loader text="Loading order details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>
          <h3>Error</h3>
          <p>{error}</p>
          <Link href="/account/orders">View My Orders</Link>
        </div>
      </div>
    );
  }

  if (!order || !company) {
    return (
      <div>
        <div>
          <h3>Order Not Found</h3>
          <p>The requested order could not be found.</p>
          <Link href="/account/orders">View My Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1>Thank You for Your Order!</h1>
          <p>
            Your booking has been submitted successfully and is currently being
            reviewed by the moving company.
          </p>
        </div>

        <div>
          <div>
            <h2>Order Overview</h2>
          </div>
          <div>
            <div>
              <div>
                <span>Order ID:</span>
                <span>{order._id}</span>
              </div>

              <div>
                <span>Order Status:</span>
                <span>Request Sent</span>
              </div>
            </div>

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
                            i < Math.round(company.averageRating) ? null : null
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span>
                      ({company.reviewsCount}&nbsp;
                      {company.reviewsCount === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                  {company.isKisteKlarCertified && (
                    <div>KisteKlar Certified</div>
                  )}
                </div>
              </div>
            </div>

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
                  <span>Preferred Date:</span>
                  <span>{formatDate(order.preferredDates[0])}</span>
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
        </div>

        <div>
          <h2>What's Next?</h2>
          <div>
            <div>
              <div>1</div>
              <h3>Confirmation</h3>
              <p>
                The moving company will review your request and confirm one of
                your preferred dates.
              </p>
            </div>

            <div>
              <div>2</div>
              <h3>Preparation</h3>
              <p>
                Once confirmed, you can prepare for your move. Check out
                our&nbsp;
                <Link href="/tips">Tips</Link> for helpful advice.
              </p>
            </div>

            <div>
              <div>3</div>
              <h3>Moving Day</h3>
              <p>
                On the agreed date, the moving team will arrive at your location
                to help with your move.
              </p>
            </div>

            <div>
              <div>4</div>
              <h3>Feedback</h3>
              <p>
                After your move is complete, please share your experience by
                leaving a review.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div>
            <h3>Check Your Email</h3>
            <p>
              We've sent a confirmation email to&nbsp;
              <strong>{account.email}</strong> with all the details of your
              order.
            </p>
            <p>If you don't see it, please check your spam folder.</p>
          </div>
        </div>

        <div>
          <Link href={`/account/orders/${order._id}`}>View Order Details</Link>

          <Link href="/account/orders">View All Orders</Link>

          <Link href="/">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}