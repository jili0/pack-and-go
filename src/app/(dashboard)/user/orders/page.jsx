// // src/app/(dashboard)/user/page.jsx (continuing from previous part)

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import OrderList from "@/components/dashboard/OrderList";

export default function UserDashboard() {
  return (
    <div>
      <OrderList />
    </div>
  );
}
