// app/api/orders/route.js - Vercel-Fix
import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // ✅ Verwende die build-sichere DB-Connection
import Order from "@/models/Order";

export async function GET() {
  try {
    // ✅ Sichere DB-Verbindung
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database nicht verfügbar" },
        { status: 503 }
      );
    }

    const orders = await Order.find({})
      .populate("accountId", "name email")
      .populate("companyId", "name email")
      .sort({ createdAt: -1 });

    // Add customer name for display
    const ordersWithCustomerName = orders.map((order) => ({
      ...order.toObject(),
      customerName: order.accountId?.name || "Unknown Customer",
    }));

    return NextResponse.json({
      success: true,
      orders: ordersWithCustomerName,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // ✅ Sichere DB-Verbindung
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database nicht verfügbar" },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // ✅ Validation
    if (!body.accountId || !body.companyId) {
      return NextResponse.json(
        { success: false, message: "accountId und companyId sind erforderlich" },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("accountId", "name email")
      .populate("companyId", "name email");

    const orderData = {
      ...populatedOrder.toObject(),
      customerName: populatedOrder.accountId?.name || "Unknown Customer",
    };

    return NextResponse.json({
      success: true,
      order: orderData,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message
      },
      { status: 500 }
    );
  }
}

// ✅ KRITISCH: Verhindert Pre-rendering beim Build
export const dynamic = 'force-dynamic';