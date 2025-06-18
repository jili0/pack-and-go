// // src/app/(dashboard)/account/page.jsx (continuing from previous part)

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import OrderList from "@/components/dashboard/OrderList";

export default function AccountDashboard() {
  return (
    <div>
      <OrderList />
    </div>
  );
}
