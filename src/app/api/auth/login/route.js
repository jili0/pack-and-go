// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { createToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();
    
    // Benutzer mit Passwort suchen
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }
    
    // Passwort überprüfen
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }
    
    // JWT-Token erstellen
    const token = createToken(user._id, user.role);
    
    // Erfolgreiche Antwort mit Token als Cookie
    const response = NextResponse.json({
      success: true,
      message: 'Anmeldung erfolgreich',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
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
    console.error('Anmeldefehler:', error);
    
    return NextResponse.json(
      { success: false, message: 'Serverfehler bei der Anmeldung' },
      { status: 500 }
    );
  }
}