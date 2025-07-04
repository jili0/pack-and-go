// src/app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    // Suche die Bestellung
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    // Prüfe, ob der Benutzer berechtigt ist, die Bestellung einzusehen
    if (
      (session.role === "user" && order.accountId.toString() !== session.id) ||
      session.role === "company"
    ) {
      // Bei Unternehmen überprüfen, ob die Bestellung zu ihrem Unternehmen gehört
      if (session.role === "company") {
        const company = await Company.findOne({ accountId: session.id });

        if (!company || order.companyId.toString() !== company._id.toString()) {
          return NextResponse.json(
            { success: false, message: "Keine Berechtigung" },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, message: "Keine Berechtigung" },
          { status: 403 }
        );
      }
    }

    // Lade zusätzliche Informationen
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

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    const { status, confirmedDate, notes } = await request.json();

    // Suche die Bestellung
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    // Prüfe, ob der Benutzer berechtigt ist, die Bestellung zu aktualisieren
    if (session.role === "company") {
      const company = await Company.findOne({ accountId: session.id });

      if (!company || order.companyId.toString() !== company._id.toString()) {
        return NextResponse.json(
          { success: false, message: "Keine Berechtigung" },
          { status: 403 }
        );
      }
    } else if (
      session.role === "user" &&
      order.accountId.toString() !== session.id
    ) {
      return NextResponse.json(
        { success: false, message: "Keine Berechtigung" },
        { status: 403 }
      );
    } else if (
      session.role !== "admin" &&
      session.role !== "user" &&
      session.role !== "company"
    ) {
      return NextResponse.json(
        { success: false, message: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    // Aktualisiere die Bestellung
    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (status === "confirmed" && confirmedDate) {
      updateData.confirmedDate = confirmedDate;
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // Sende E-Mail-Benachrichtigung bei Statusänderung
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


export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    // Suche die Bestellung
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    // Berechtigungsprüfung für alle Rollen
    let hasPermission = false;
    let isUser = false;

    if (session.role === "admin") {
      hasPermission = true;
    } else if (session.role === "user" && order.accountId.toString() === session.id) {
      hasPermission = true;
      isUser = true; 
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

    // get the account and company details
    const account = await Account.findById(order.accountId);
    const company = await Company.findById(order.companyId);

    let result;
    let message;

    // unter company and admin roles, we really delete the order
    if (isUser) {
      // user: only cancel the order
      result = await Order.findByIdAndUpdate(
        id,
        { status: "cancelled" },
        { new: true }
      );

      message = "Bestellung erfolgreich storniert";

      // send order cancellation email
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

    } else {
      // company and admin：really delete order
      await Order.findByIdAndDelete(id);
      result = null; 
      message = "Bestellung erfolgreich gelöscht";

      // // send order deletion email
      // await sendOrderDeletionEmail({
      //   email: account.email,
      //   name: account.name,
      //   orderId: order._id,
      //   companyName: company.companyName,
      //   fromCity: order.fromAddress.city,
      //   toCity: order.toAddress.city,
      //   deletedBy: session.role, // who deleted the order
      // });
    }

    return NextResponse.json(
      {
        success: true,
        message: message,
        order: result,
        action: isUser ? "cancelled" : "deleted" // indicate the action taken
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