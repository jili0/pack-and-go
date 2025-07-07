import { NextResponse } from "next/server";

export async function POST(request) {
    try {
      const body = await request.json(); // Verwende request.json(), um den Body im App Router zu parsen
      const { type, orderId, companyId, message, target } = body;
  
      // --- WICHTIG: Implementiere hier deine tatsächliche Logik zur Speicherung/Versand von Benachrichtigungen ---
      // Hier würdest du die Benachrichtigung in deiner Datenbank speichern, eine E-Mail senden usw.
      console.log(`API NOTIFICATION (APP ROUTER): Fallback-Benachrichtigung erhalten für Firma ${companyId}: ${message}`);
      // Sende eine Erfolgsantwort
      return NextResponse.json({ success: true, message: 'Benachrichtigung über API-Fallback verarbeitet.' }, { status: 200 });
  
    } catch (error) {
      console.error("API NOTIFICATION (APP ROUTER): Fehler beim Verarbeiten der Benachrichtigung:", error);
      return NextResponse.json({ success: false, message: 'Fehler beim Verarbeiten der Benachrichtigung.' }, { status: 500 });
    }
  }