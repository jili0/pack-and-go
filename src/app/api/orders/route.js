import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";
// ✅ Email Imports optional machen
// import {
//   sendOrderConfirmationEmail,
//   sendNewOrderNotificationEmail,
// } from "@/lib/email";

// 📥 GET: Alle Bestellungen basierend auf Rolle
export async function GET(request) {
  try {
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

    let query = {};

    if (session.role === "user") {
      query.accountId = session.id;
    } else if (session.role === "company") {
      query.companyAccountId = session.id;
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    if (statusFilter) {
      query.status = statusFilter;
    }

    const orders = await Order.find(query)
      .populate("accountId", "name email phone")
      .populate("companyId", "companyName email phone")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("Fehler beim Abrufen der Bestellungen:", error);
    return NextResponse.json(
      { success: false, message: "Serverfehler beim Abrufen der Bestellungen", error: error.message },
      { status: 500 }
    );
  }
}

// 📤 POST: Neue Bestellung anlegen
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Nicht autorisiert" }, { status: 401 });
    }

    // ✅ Sichere DB-Verbindung
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database nicht verfügbar" },
        { status: 503 }
      );
    }

    const {
      companyId,
      fromAddress,
      toAddress,
      preferredDates,
      helpersCount,
      estimatedHours,
      totalPrice,
      notes,
    } = await request.json();

    if (
      !companyId ||
      !fromAddress ||
      !toAddress ||
      !preferredDates ||
      preferredDates.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Alle Pflichtfelder müssen ausgefüllt sein" },
        { status: 400 }
      );
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { success: false, message: "Die ausgewählte Umzugsfirma wurde nicht gefunden" },
        { status: 404 }
      );
    }

    const newOrder = await Order.create({
      accountId: session.id,
      companyId,
      companyAccountId: company.accountId, // ✅ Wird jetzt gesetzt!
      fromAddress,
      toAddress,
      preferredDates: preferredDates.map(date => new Date(date)),
      helpersCount,
      estimatedHours,
      totalPrice,
      notes,
      status: "pending",
    });

    await Account.findByIdAndUpdate(session.id, {
      $push: { orders: newOrder._id },
    });

    const account = await Account.findById(session.id);

    // ✅ E-Mails optional (für Vercel Demo)
    try {
      // await sendOrderConfirmationEmail({
      //   email: account.email,
      //   name: account.name,
      //   orderId: newOrder._id,
      //   companyName: company.companyName,
      //   fromCity: fromAddress.city,
      //   toCity: toAddress.city,
      //   preferredDate: preferredDates[0],
      //   totalPrice,
      // });

      // await sendNewOrderNotificationEmail({
      //   email: company.email,
      //   companyName: company.companyName,
      //   orderDetails: {
      //     id: newOrder._id,
      //     customerName: account.name,
      //     customerEmail: account.email,
      //     customerPhone: account.phone,
      //     fromAddress,
      //     toAddress,
      //     preferredDates,
      //     helpersCount,
      //     estimatedHours,
      //     totalPrice,
      //     notes,
      //   },
      // });

      console.log(`📧 Demo: Emails würden gesendet an ${account.email} und ${company.email}`);
    } catch (emailError) {
      console.warn('⚠️ Email sending failed (demo mode):', emailError);
    }

    // ✅ Socket optional (für Vercel Demo)
    try {
      const socketResponse = await fetch(
        `${process.env.NEXT_PUBLIC_URL || 'https://pack-and-go-liard.vercel.app'}/api/socket/emit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order-created',
            data: {
              orderId: newOrder._id.toString(),
              companyId: companyId.toString(),
            },
          }),
        }
      );

      if (socketResponse.ok) {
        console.log('✅ Socket event order-created emitted successfully');
      } else {
        console.warn('⚠️ Failed to emit socket event order-created');
      }
    } catch (socketError) {
      console.warn('⚠️ Socket event failed (demo mode):', socketError);
    }

    return NextResponse.json(
      { success: true, message: "Bestellung erfolgreich erstellt", order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Fehler beim Erstellen der Bestellung:", error);
    return NextResponse.json(
      { success: false, message: "Serverfehler beim Erstellen der Bestellung", error: error.message },
      { status: 500 }
    );
  }
}

// ✅ KRITISCH: Verhindert Pre-rendering beim Build
export const dynamic = 'force-dynamic';