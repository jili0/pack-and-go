"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Loader from "@/components/ui/Loader";
import Link from "next/link";
import { OrderInfo } from "@/app/(dashboard)/account/orders/[id]/page";

export default function OrderConfirmation() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { account, initialCheckDone } = useAuth();
  const orderLoading = useLoading("api", "orderConfirmation");

  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialCheckDone) return;
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
  }, [id, initialCheckDone, account, router]);

  if (!initialCheckDone || orderLoading.isLoading) {
    return <Loader text="Loading order details..." />;
  }

  if (error) {
    return (
      <div>
        <h3>Error</h3>
        <p>{error}</p>
        <Link href="/account/orders">View My Orders</Link>
      </div>
    );
  }

  if (!order || !company) {
    return (
      <div>
        <h3>Order Not Found</h3>
        <p>The requested order could not be found.</p>
        <Link href="/account/orders">View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div>
        <svg
          className="icon"
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
        <h1>Thank You for Your Order!</h1>
        <p>
          Your booking has been submitted successfully and is currently being
          reviewed by the moving company.
        </p>
      </div>

      <div className="order-overview">
        <h1>Order Overview</h1>
        <OrderInfo order={order} company={company} />
      </div>

      <div className="email-notification">
        <svg
          className="icon"
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
        <div>
          <h1>Check Your Email</h1>
          <p>
            We've sent a confirmation email to <strong>{account?.email}</strong>{" "}
            with all the details of your order.
          </p>
          <p>If you don't see it, please check your spam folder.</p>
        </div>
      </div>

      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
