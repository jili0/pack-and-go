// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Account from "@/models/Account";
import { createToken, setTokenCookie } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request) {
  try {
    console.log("=== REGISTER REQUEST START ===");
    await connectDB();
    console.log("✓ Database connected");

    let requestData;
    try {
      requestData = await request.json();
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          message: "Ungültiger oder bereits gelesener Request-Body",
        },
        { status: 400 }
      );
    }
    console.log("📦 Request data:", requestData);

    const { name, email, password, phone, role = "user" } = requestData;
    console.log("🔍 Extracted fields:", {
      name,
      email,
      phone,
      role,
      passwordLength: password?.length,
    });

    // Validierung der Eingabedaten
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Alle Pflichtfelder müssen ausgefüllt werden",
        },
        { status: 400 }
      );
    }

    // E-Mail-Format validieren
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
        },
        { status: 400 }
      );
    }

    // Passwortlänge validieren
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Das Passwort muss mindestens 6 Zeichen lang sein",
        },
        { status: 400 }
      );
    }

    // Prüfen, ob der Benutzer bereits existiert
    try {
      const existingAccount = await Account.findOne({ email });

      if (existingAccount) {
        return NextResponse.json(
          {
            success: false,
            message: "Diese E-Mail-Adresse wird bereits verwendet",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Fehler bei der Benutzerüberprüfung:", error);
      // Fehler bei der Benutzerüberprüfung ignorieren, da möglicherweise keine DB-Verbindung besteht
    }

    // Zulässige Rollen beschränken
    if (!["user", "company"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Ungültige Rolle" },
        { status: 400 }
      );
    }

    // Neuen Benutzer erstellen
    let newAccount;
    try {
      newAccount = await Account.create({
        name,
        email,
        password,
        phone,
        role,
      });
    } catch (error) {
      console.error("Fehler beim Erstellen des Benutzers:", error);

      if (error.name === "ValidationError") {
        const errors = Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        }));

        return NextResponse.json(
          {
            success: false,
            message: "Validierungsfehler",
            errors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Serverfehler bei der Benutzerregistrierung",
        },
        { status: 500 }
      );
    }

    // Willkommens-E-Mail senden (optional - könnte fehlschlagen)
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error("Fehler beim Senden der Willkommens-E-Mail:", emailError);
      // Wir wollen nicht die Registrierung abbrechen, wenn die E-Mail nicht gesendet werden kann
    }

    // JWT-Token erstellen
    const token = createToken(newAccount._id, newAccount.role);

    // Token als Cookie setzen
    const response = NextResponse.json(
      {
        success: true,
        message: "Registrierung erfolgreich",
        account: {
          id: newAccount._id,
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.role,
        },
      },
      { status: 201 }
    );

    // Cookie setzen
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 Tage
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Registrierungsfehler:", error);

    return NextResponse.json(
      { success: false, message: "Serverfehler bei der Registrierung" },
      { status: 500 }
    );
  }
}