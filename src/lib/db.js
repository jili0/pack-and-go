// src/lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

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
  // Prüfe MONGODB_URI nur wenn die Funktion aufgerufen wird, nicht bei Modul-Evaluierung
  // Dies erlaubt dem Build-Prozess zu laufen, auch wenn MONGODB_URI nicht gesetzt ist
  if (!MONGODB_URI) {
    // Während Build-Zeit oder Development: nur warnen, nicht abstürzen
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development' ||
                        process.env.NODE_ENV === 'development';
    
    if (isBuildTime) {
      // Während Build: Stille Rückgabe, damit Build nicht fehlschlägt
      // Die Warnung würde zu viel Build-Output erzeugen
      return { connection: { readyState: 1 } };
    } else {
      // In Produktion zur Laufzeit: Fehler werfen
      throw new Error('MONGODB_URI Umgebungsvariable nicht gefunden. Bitte definieren Sie die MONGODB_URI-Umgebungsvariable in Ihrer .env.local-Datei');
    }
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