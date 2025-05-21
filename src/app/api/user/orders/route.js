// src/app/api/user/orders/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Company from "@/models/Company";
import { getSession } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    // Finde alle Bestellungen des Benutzers
    const orders = await Order.find({ userId: session.id }).sort({
      createdAt: -1,
    });

    // Füge zusätzliche Informationen hinzu
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const company = await Company.findById(order.companyId).select(
          "companyName"
        );

        return {
          ...order.toObject(),
          companyName: company ? company.companyName : "Unbekannte Firma",
        };
      })
    );

    return NextResponse.json(
      { success: true, orders: ordersWithDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzerbestellungen:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Serverfehler beim Abrufen der Benutzerbestellungen",
      },
      { status: 500 }
    );
  }
}
