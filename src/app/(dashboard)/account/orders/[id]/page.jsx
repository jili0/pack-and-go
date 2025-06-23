"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import OrderDetails from "@/components/dashboard/OrderDetails";
import { useEffect, useState } from "react";

export default function AccountDashboard() {
  const params = useParams();
  const orderId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const { account } = useAuth();

  useEffect(() => {
    if (orderId !== undefined) {
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div>
        <div></div>
        <p>Loading order data...</p>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div>
        <h2>Invalid Order ID</h2>
        <p>
          Unable to find the specified order. Please check the URL or return to
          homepage.
        </p>
        <Link href="/">Return to Homepage</Link>
      </div>
    );
  }

  if (!account) {
    return (
      <div>
        <h2>Login Required</h2>
        <p>Please log in to view your orders.</p>
        <Link href="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div>
      <OrderDetails orderId={orderId} />
    </div>
  );
}
