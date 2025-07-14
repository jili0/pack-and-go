// src/lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Bessere Fehlerbehandlung für fehlende Umgebungsvariablen
if (!MONGODB_URI) {
  // Im Entwicklungsmodus nur warnen, nicht abstürzen
  if (process.env.NODE_ENV === 'development') {
    console.error('WARNUNG: Keine MONGODB_URI in der .env.local-Datei gefunden. Stelle sicher, dass die Datei existiert und die Variable korrekt ist.');
    console.error('Für lokale Entwicklung, erstelle eine .env.local Datei mit:');
    console.error('MONGODB_URI=mongodb://localhost:27017/pack-and-go');
  } else {
    // In Produktion ist es kritischer
    throw new Error('MONGODB_URI Umgebungsvariable nicht gefunden. Bitte definieren Sie die MONGODB_URI-Umgebungsvariable in Ihrer .env.local-Datei');
  }
}

/**
 * Globale Variable zum Speichern der Verbindung
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Stellt eine Verbindung zur MongoDB-Datenbank her
 * @returns {Promise<Mongoose>} - Eine Mongoose-Instanz
 */
async function connectDB() {
  // Wenn keine MONGODB_URI vorhanden ist und wir im Entwicklungsmodus sind,
  // simulieren wir eine Verbindung für Tests
  if (!MONGODB_URI && process.env.NODE_ENV === 'development') {
    console.warn('Entwicklungsmodus: MONGODB_URI nicht gefunden, simuliere Datenbankverbindung.');
    return { connection: { readyState: 1 } };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB-Verbindung hergestellt');
        return mongoose;
      })
      .catch((error) => {
        console.error('Fehler bei der MongoDB-Verbindung:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Bei Verbindungsfehlern in der Entwicklung eine Warnung ausgeben
    if (process.env.NODE_ENV === 'development') {
      console.error('Fehler bei der MongoDB-Verbindung. Simuliere Verbindung für Entwicklungszwecke.');
      return { connection: { readyState: 1 } };
    }
    throw error;
  }
}

export default connectDB;