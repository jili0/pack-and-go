import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

// ---------------------- GET ----------------------
export async function GET(request, context) {
  try {
    const { id } = await context.params;

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    // ✅ Zugriffskontrolle
    if (
      (session.role === "user" && order.accountId.toString() !== session.id) ||
      (session.role === "company" && order.companyAccountId?.toString() !== session.id)
    ) {
      return NextResponse.json(
        { success: false, message: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const company = await Company.findById(order.companyId).select(
      "companyName email phone isKisteKlarCertified averageRating reviewsCount"
    );
    const account = await Account.findById(order.accountId).select(
      "name email phone"
    );

    return NextResponse.json(
      {
        success: true,
        order: {
          ...order.toObject(),
          companyName: company.companyName,
          customerName: account.name,
          customerEmail: account.email,
          customerPhone: account.phone,
        },
        company,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Abrufen der Bestelldetails:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Serverfehler beim Abrufen der Bestelldetails",
      },
      { status: 500 }
    );
  }
}

// ---------------------- PUT ----------------------
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    const { status, confirmedDate, notes } = await request.json();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    // ✅ Zugriff prüfen
    if (
      (session.role === "user" && order.accountId.toString() !== session.id) ||
      (session.role === "company" && order.companyAccountId?.toString() !== session.id)
    ) {
      return NextResponse.json(
        { success: false, message: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (status === "confirmed" && confirmedDate) updateData.confirmedDate = confirmedDate;
    if (notes) updateData.notes = notes;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // ✅ E-Mail bei Statusänderung
    if (status && status !== order.status) {
      const account = await Account.findById(order.accountId);
      const company = await Company.findById(order.companyId);

      await sendOrderStatusUpdateEmail({
        email: account.email,
        name: account.name,
        orderId: order._id,
        oldStatus: order.status,
        newStatus: status,
        companyName: company.companyName,
        fromCity: order.fromAddress.city,
        toCity: order.toAddress.city,
        confirmedDate: updatedOrder.confirmedDate,
      });

      // ✅ Direktes Socket.IO Event
      const io = globalThis.io;

      if (io) {
        const payload = {
          orderId: order._id.toString(),
          target: "user",
          timestamp: new Date().toISOString(),
        };

        if (status === "confirmed") {
          io.to(`user-${order.accountId}`).emit("notification", {
            ...payload,
            type: "order-confirmed",
            message: `Your booking has been confirmed! (ID: ${order._id})`,
          });

          io.to("admin").emit("notification", {
            ...payload,
            target: "admin",
            type: "order-confirmed",
            message: `Booking confirmed: ${order._id} for user: ${order.accountId}`,
          });

          console.log("✅ Socket: Sent 'order-confirmed'");
        }

        if (status === "cancelled") {
          io.to(`user-${order.accountId}`).emit("notification", {
            ...payload,
            type: "order-cancelled",
            message: `Your booking was declined. (ID: ${order._id})`,
          });

          io.to("admin").emit("notification", {
            ...payload,
            target: "admin",
            type: "order-cancelled",
            message: `Booking cancelled: ${order._id} for user: ${order.accountId}`,
          });

          console.log("✅ Socket: Sent 'order-cancelled'");
        }
      } else {
        console.warn("⚠️ globalThis.io is not defined – no socket event sent.");
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Bestellung erfolgreich aktualisiert",
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Bestellung:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Serverfehler beim Aktualisieren der Bestellung",
      },
      { status: 500 }
    );
  }
}

// ---------------------- DELETE ----------------------
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    const account = await Account.findById(order.accountId);
    const company = await Company.findById(order.companyId);

    let hasPermission = false;
    let isUser = false;

    if (session.role === "admin") {
      hasPermission = true;
    } else if (session.role === "user" && order.accountId.toString() === session.id) {
      hasPermission = true;
      isUser = true;
    } else if (session.role === "company" && order.companyAccountId?.toString() === session.id) {
      hasPermission = true;
    }

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    let result;
    let message;

    if (isUser) {
      result = await Order.findByIdAndUpdate(
        id,
        { status: "cancelled" },
        { new: true }
      );
      message = "Bestellung erfolgreich storniert";

      await sendOrderStatusUpdateEmail({
        email: account.email,
        name: account.name,
        orderId: order._id,
        oldStatus: order.status,
        newStatus: "cancelled",
        companyName: company.companyName,
        fromCity: order.fromAddress.city,
        toCity: order.toAddress.city,
      });
      // 🟡 Socket-Event senden, wenn der Nutzer storniert hat
try {
  const socketResponse = await fetch(
    `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/socket/emit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "order-cancelled",
        data: {
          orderId: order._id.toString(),
          accountId: account._id.toString(),
        },
      }),
    }
  );

  if (socketResponse.ok) {
    console.log("✅ Socket event 'order-cancelled' emitted from DELETE");
  } else {
    console.warn("⚠️ Failed to emit 'order-cancelled' from DELETE");
  }
} catch (socketError) {
  console.error("❌ Error emitting 'order-cancelled' from DELETE:", socketError);
}

    } else {
      await Order.findByIdAndDelete(id);
      result = null;
      message = "Bestellung erfolgreich gelöscht";
    }

    return NextResponse.json(
      {
        success: true,
        message,
        order: result,
        action: isUser ? "cancelled" : "deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Bestellung:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Serverfehler beim Verarbeiten der Bestellung",
      },
      { status: 500 }
    );
  }
}
