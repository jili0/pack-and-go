// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Abmeldung erfolgreich'
  });
  
  // Token-Cookie entfernen
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    sameSite: 'strict'
  });
  
  return response;
}