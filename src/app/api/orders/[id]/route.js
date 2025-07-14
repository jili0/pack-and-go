// app/api/orders/[id]/route.js - Vercel-Fix
import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // ✅ Verwende die build-sichere DB-Connection
import Order from "@/models/Order";

export async function GET(request, { params }) {
  try {
    // ✅ Sichere DB-Verbindung
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database nicht verfügbar" },
        { status: 503 }
      );
    }

    // Await params in Next.js 15+
    const { id } = await params;

    const order = await Order.findById(id)
      .populate("accountId", "name email")
      .populate("companyId", "name email");

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Add customer name for display
    const orderData = {
      ...order.toObject(),
      customerName: order.accountId?.name || "Unknown Customer",
    };

    return NextResponse.json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    // ✅ Sichere DB-Verbindung
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database nicht verfügbar" },
        { status: 503 }
      );
    }

    // Await params in Next.js 15+
    const { id } = await params;
    const body = await request.json();

    const order = await Order.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    )
      .populate("accountId", "name email")
      .populate("companyId", "name email");

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Add customer name for display
    const orderData = {
      ...order.toObject(),
      customerName: order.accountId?.name || "Unknown Customer",
    };

    return NextResponse.json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // ✅ Sichere DB-Verbindung
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database nicht verfügbar" },
        { status: 503 }
      );
    }

    // Await params in Next.js 15+
    const { id } = await params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete order",
        error: error.message
      },
      { status: 500 }
    );
  }
}

// ✅ KRITISCH: Verhindert Pre-rendering beim Build
export const dynamic = 'force-dynamic';