// src/app/api/contact/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        message: 'Bitte füllen Sie alle erforderlichen Felder aus'
      }, { status: 400 });
    }

    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      }, { status: 400 });
    }

    // In einer echten Anwendung würden wir hier E-Mails versenden
    // Da wir das im Entwicklungsmodus möglicherweise nicht können,
    // simulieren wir erfolgreiches Senden

    // Simuliere eine verzögerte Antwort, um ein realistisches Verhalten zu zeigen
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Erfolgsantwort senden
    return NextResponse.json({
      success: true,
      message: 'Vielen Dank für Ihre Nachricht! Wir werden uns so schnell wie möglich bei Ihnen melden.'
    }, { status: 200 });

  } catch (error) {
    console.error('Fehler beim Verarbeiten des Kontaktformulars:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Ein Fehler ist aufgetreten beim Verarbeiten des Formulars. Bitte versuchen Sie es später erneut.'
    }, { status: 500 });
  }
}