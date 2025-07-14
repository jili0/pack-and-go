import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";
// ✅ Email Import optional machen
// import { sendOrderStatusUpdateEmail } from "@/lib/email";

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

    // ✅ Sichere DB-Verbindung
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database nicht verfügbar" },
        { status: 503 }
      );
    }

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
        error: error.message
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

    // ✅ Sichere DB-Verbindung
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database nicht verfügbar" },
        { status: 503 }
      );
    }

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

    // ✅ E-Mail bei Statusänderung (optional für Demo)
    if (status && status !== order.status) {
      try {
        const account = await Account.findById(order.accountId);
        const company = await Company.findById(order.companyId);

        // await sendOrderStatusUpdateEmail({
        //   email: account.email,
        //   name: account.name,
        //   orderId: order._id,
        //   oldStatus: order.status,
        //   newStatus: status,
        //   companyName: company.companyName,
        //   fromCity: order.fromAddress.city,
        //   toCity: order.toAddress.city,
        //   confirmedDate: updatedOrder.confirmedDate,
        // });

        console.log(`📧 Demo: Status update email würde gesendet an ${account.email}`);
      } catch (emailError) {
        console.warn('⚠️ Email sending failed (demo mode):', emailError);
      }

      // ✅ Socket.IO Event (optional für Vercel)
      try {
        const socketResponse = await fetch(
          `${process.env.NEXT_PUBLIC_URL || 'https://pack-and-go-liard.vercel.app'}/api/socket/emit`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: status === "confirmed" ? 'order-confirmed' : 
                     status === "cancelled" ? 'order-cancelled' : 'order-updated',
              data: {
                orderId: order._id.toString(),
                accountId: order.accountId.toString(),
                companyId: order.companyId.toString(),
              },
            }),
          }
        );

        if (socketResponse.ok) {
          console.log(`✅ Socket event ${status} emitted successfully`);
        } else {
          console.warn(`⚠️ Failed to emit socket event ${status}`);
        }
      } catch (socketError) {
        console.warn('⚠️ Socket event failed (demo mode):', socketError);
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
        error: error.message
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

    // ✅ Sichere DB-Verbindung
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database nicht verfügbar" },
        { status: 503 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    // ✅ Zugriffskontrolle
    let hasPermission = false;

    if (session.role === "admin") {
      hasPermission = true;
    } else if (
      session.role === "user" &&
      order.accountId.toString() === session.id
    ) {
      hasPermission = true;
    } else if (session.role === "company") {
      const company = await Company.findOne({ accountId: session.id });
      if (company && order.companyId.toString() === company._id.toString()) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    // ✅ Order löschen
    await Order.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Bestellung erfolgreich gelöscht",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Löschen der Bestellung:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Serverfehler beim Löschen der Bestellung",
        error: error.message
      },
      { status: 500 }
    );
  }
}

// ✅ KRITISCH: Verhindert Pre-rendering beim Build
export const dynamic = 'force-dynamic';