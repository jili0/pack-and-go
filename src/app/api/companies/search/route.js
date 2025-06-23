// src/app/api/companies/search/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Company from '@/models/Company';

export async function POST(request) {
  try {
    await connectDB();
    
    const { fromCity, toCity, helpersCount, estimatedHours } = await request.json();
    
    // Validiere die Eingaben
    if (!fromCity || !toCity) {
      return NextResponse.json(
        { success: false, message: 'Start- und Zielort müssen angegeben werden' },
        { status: 400 }
      );
    }
    
    // Suche nach Unternehmen, die für die angegebene Route verfügbar sind
    const companies = await Company.find({
      isVerified: true, // Nur verifizierte Unternehmen
      $or: [
        // Unternehmen, die die genaue Route bedienen
        {
          'serviceAreas': {
            $elemMatch: {
              from: { $regex: new RegExp(fromCity, 'i') },
              to: { $regex: new RegExp(toCity, 'i') }
            }
          }
        },
        // Unternehmen, die die umgekehrte Route bedienen
        {
          'serviceAreas': {
            $elemMatch: {
              from: { $regex: new RegExp(toCity, 'i') },
              to: { $regex: new RegExp(fromCity, 'i') }
            }
          }
        },
        // Unternehmen, die in beiden Städten tätig sind (ohne direkte Route)
        {
          'serviceAreas.from': { $regex: new RegExp(fromCity, 'i') },
          'serviceAreas.to': { $regex: new RegExp(toCity, 'i') }
        }
      ]
    }).select('companyName isKisteKlarCertified averageRating reviewsCount serviceAreas logo');
    
    // Für Testzwecke: Wenn keine Unternehmen gefunden wurden, erstelle einige Beispielunternehmen
    // In der Produktionsumgebung sollte dies entfernt werden
    if (companies.length === 0) {
      return NextResponse.json(
        { 
          success: true,
          companies: [
            {
              _id: '123456789012345678901234',
              companyName: 'Schnell & Sicher Umzüge',
              isKisteKlarCertified: true,
              averageRating: 4.8,
              reviewsCount: 124,
              serviceAreas: [
                { from: fromCity, to: toCity }
              ],
              description: 'Wir sind ein erfahrenes Umzugsunternehmen mit über 15 Jahren Erfahrung. Unser Team sorgt für einen schnellen und sicheren Umzug Ihrer Möbel und Gegenstände.'
            },
            {
              _id: '123456789012345678901235',
              companyName: 'EasyMove GmbH',
              isKisteKlarCertified: false,
              averageRating: 4.2,
              reviewsCount: 86,
              serviceAreas: [
                { from: fromCity, to: toCity }
              ],
              description: 'Mit EasyMove wird Ihr Umzug zum Kinderspiel. Wir bieten günstige Preise und zuverlässigen Service.'
            },
            {
              _id: '123456789012345678901236',
              companyName: 'Premium Transport',
              isKisteKlarCertified: true,
              averageRating: 4.9,
              reviewsCount: 58,
              serviceAreas: [
                { from: fromCity, to: toCity }
              ],
              description: 'Premium Transport steht für erstklassigen Umzugsservice. Wir behandeln Ihre Gegenstände mit höchster Sorgfalt und Professionalität.'
            },
            {
              _id: '123456789012345678901237',
              companyName: 'Stadtumzüge',
              isKisteKlarCertified: false,
              averageRating: 4.0,
              reviewsCount: 103,
              serviceAreas: [
                { from: fromCity, to: toCity }
              ],
              description: 'Spezialisiert auf Umzüge innerhalb und zwischen Städten. Faire Preise und flexible Termine.'
            },
            {
              _id: '123456789012345678901238',
              companyName: 'KisteKlar Transporte',
              isKisteKlarCertified: true,
              averageRating: 4.6,
              reviewsCount: 92,
              serviceAreas: [
                { from: fromCity, to: toCity }
              ],
              description: 'Zertifizierter Umzugsservice mit Garantie. Schnell, zuverlässig und transparent.'
            }
          ]
        }
      );
    }
    
    return NextResponse.json(
      { success: true, companies },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Fehler bei der Suche nach Umzugsfirmen:', error);
    
    return NextResponse.json(
      { success: false, message: 'Serverfehler bei der Suche nach Umzugsfirmen' },
      { status: 500 }
    );
  }
}