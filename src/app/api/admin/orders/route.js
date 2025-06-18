import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/models/Order";

// MongoDB Connection
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

export async function GET() {
  try {
    await connectDB();

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
      },
      { status: 500 }
    );
  }
}
