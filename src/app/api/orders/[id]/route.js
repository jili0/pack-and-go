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
      (session.role === "company" &&
        order.companyAccountId?.toString() !== session.id)
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
      (session.role === "company" &&
        order.companyAccountId?.toString() !== session.id)
    ) {
      return NextResponse.json(
        { success: false, message: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (status === "confirmed" && confirmedDate)
      updateData.confirmedDate = confirmedDate;
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

      // ✅ Direktes Socket.IO Event - KORRIGIERT
      const io = globalThis.io;

      if (io) {
        const payload = {
          orderId: order._id.toString(),
          timestamp: new Date().toISOString(),
        };

        if (status === "confirmed") {
          io.to(`user-${order.accountId}`).emit("notification", {
            ...payload,
            target: "user",
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
          // ✅ KORRIGIERT: Unterscheide zwischen Company-Cancellation und User-Cancellation
          if (session.role === "company") {
            // Company storniert → User benachrichtigen
            io.to(`user-${order.accountId}`).emit("notification", {
              ...payload,
              target: "user",
              type: "order-cancelled",
              message: `Your booking was declined. (ID: ${order._id})`,
            });
            console.log("✅ Socket: Sent 'order-cancelled' (company declined)");
          } else if (session.role === "user") {
            // User storniert → Company benachrichtigen
            io.to(`company-${order.companyAccountId}`).emit("notification", {
              ...payload,
              target: "company",
              type: "order-user-cancelled",
              message: `Customer cancelled their booking (ID: ${order._id})`,
              accountId: order.accountId,
            });
            console.log("✅ Socket: Sent 'order-user-cancelled' (user cancelled)");
          }
          
          // Admin bekommt immer eine Benachrichtigung
          io.to("admin").emit("notification", {
            ...payload,
            target: "admin",
            type: session.role === "company" ? "order-cancelled" : "order-user-cancelled",
            message: `Booking cancelled: ${order._id} by ${session.role}`,
            accountId: order.accountId,
            companyId: order.companyId,
          });
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