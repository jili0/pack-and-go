// src/app/api/company/me/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "company") {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    // Suche das Unternehmen basierend auf der Benutzer-ID
    const company = await Company.findOne({ accountId: session.id });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Firmenprofil nicht gefunden" },
        { status: 404 }
      );
    }

    // Hole auch die Benutzerdaten
    const account = await Account.findById(session.id).select("-password");

    return NextResponse.json(
      {
        success: true,
        company: company.toObject(),
        account: account.toObject(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Abrufen des Firmenprofils:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Serverfehler beim Abrufen des Firmenprofils",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "company") {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    const updateData = await request.json();

    // Suche das Unternehmen
    const company = await Company.findOne({ accountId: session.id });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Firmenprofil nicht gefunden" },
        { status: 404 }
      );
    }

    // Erlaubte Felder für Updates
    const allowedFields = [
      "companyName",
      "description",
      "hourlyRate",
      "address",
      "serviceAreas",
    ];

    // Filtere nur erlaubte Felder
    const filteredUpdate = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdate[key] = updateData[key];
      }
    });

    // Aktualisiere das Unternehmen
    const updatedCompany = await Company.findByIdAndUpdate(
      company._id,
      { $set: filteredUpdate },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Firmenprofil erfolgreich aktualisiert",
        company: updatedCompany.toObject(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Firmenprofils:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Serverfehler beim Aktualisieren des Firmenprofils",
      },
      { status: 500 }
    );
  }
}
