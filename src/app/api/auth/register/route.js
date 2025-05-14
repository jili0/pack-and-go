// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { createToken, setTokenCookie } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    
    const { name, email, password, phone, role = 'user' } = await request.json();
    
    // Prüfen, ob der Benutzer bereits existiert
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Diese E-Mail-Adresse wird bereits verwendet' },
        { status: 400 }
      );
    }
    
    // Zulässige Rollen beschränken
    if (!['user', 'company'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Ungültige Rolle' },
        { status: 400 }
      );
    }
    
    // Neuen Benutzer erstellen
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      role
    });
    
    // Willkommens-E-Mail senden
    await sendWelcomeEmail(email, name);
    
    // JWT-Token erstellen
    const token = createToken(newUser._id, newUser.role);
    
    // Token als Cookie setzen
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Registrierung erfolgreich',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      },
      { status: 201 }
    );
    
    // Cookie setzen
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 Tage
      sameSite: 'strict'
    });
    
    return response;
    
  } catch (error) {
    console.error('Registrierungsfehler:', error);
    
    return NextResponse.json(
      { success: false, message: 'Serverfehler bei der Registrierung' },
      { status: 500 }
    );
  }
}