// src/app/api/orders/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Company from "@/models/Company";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import {
  sendOrderConfirmationEmail,
  sendNewOrderNotificationEmail,
} from "@/lib/email";

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

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

    // Validiere die Eingaben
    if (
      !companyId ||
      !fromAddress ||
      !toAddress ||
      !preferredDates ||
      preferredDates.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Alle Pflichtfelder müssen ausgefüllt sein",
        },
        { status: 400 }
      );
    }

    // Überprüfe, ob die Firma existiert
    // const company = await Company.findById(companyId);
    const company = await Company.findOne({_id:companyId});
 
    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "Die ausgewählte Umzugsfirma wurde nicht gefunden",
        },
        { status: 404 }
      );
    }

    // Erstelle die Bestellung
    const newOrder = await Order.create({
      userId: session.id,
      companyId,
      fromAddress,
      toAddress,
      // preferredDates,
      preferredDates: preferredDates.map(date => new Date(date)), // Convert strings to Dates
      helpersCount,
      estimatedHours,
      totalPrice,
      notes,
      status: "pending",
    });

    // Aktualisiere die Benutzer- und Firmendaten mit der neuen Bestellung
    await User.findByIdAndUpdate(session.id, {
      $push: { orders: newOrder._id },
    });

    // Sende Bestätigungsemails
    const user = await User.findById(session.id);

    // E-Mail an den Benutzer
    await sendOrderConfirmationEmail({
      email: user.email,
      name: user.name,
      orderId: newOrder._id,
      companyName: company.companyName,
      fromCity: fromAddress.city,
      toCity: toAddress.city,
      preferredDate: preferredDates[0],
      totalPrice,
    });

    // E-Mail an die Firma
    await sendNewOrderNotificationEmail({
      email: company.email,
      companyName: company.companyName,
      orderDetails: {
        id: newOrder._id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        fromAddress,
        toAddress,
        preferredDates,
        helpersCount,
        estimatedHours,
        totalPrice,
        notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bestellung erfolgreich erstellt",
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Fehler beim Erstellen der Bestellung:", error);

    return NextResponse.json(
      { success: false, message: "Serverfehler beim Erstellen der Bestellung" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    // Prüfe die Rolle des Benutzers
    if (session.role === "user") {
      // Benutzer sehen nur ihre eigenen Bestellungen
      const orders = await Order.find({ userId: session.id })
        .populate("companyId", "companyName")
        .sort({ createdAt: -1 });

      return NextResponse.json({ success: true, orders }, { status: 200 });
    } else if (session.role === "company") {
      // Unternehmen sehen nur Bestellungen für ihr Unternehmen
      const company = await Company.findOne({ userId: session.id });

      if (!company) {
        return NextResponse.json(
          { success: false, message: "Unternehmen nicht gefunden" },
          { status: 404 }
        );
      }

      const orders = await Order.find({ companyId: company._id })
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 });

      return NextResponse.json({ success: true, orders }, { status: 200 });
    } else if (session.role === "admin") {
      // Administratoren sehen alle Bestellungen
      const orders = await Order.find()
        .populate("userId", "name email")
        .populate("companyId", "companyName")
        .sort({ createdAt: -1 });

      return NextResponse.json({ success: true, orders }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, message: "Keine Berechtigung" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Bestellungen:", error);

    return NextResponse.json(
      { success: false, message: "Serverfehler beim Abrufen der Bestellungen" },
      { status: 500 }
    );
  }
}
