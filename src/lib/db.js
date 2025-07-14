// src/lib/db.js - Build-sicherer Mongoose Connection
import mongoose from 'mongoose';

// ✅ Build-sichere Überprüfung - NUR warnen, nicht crashen
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // ✅ Nur warnen, nicht den Build stoppen
  console.warn('⚠️ MONGODB_URI nicht gefunden - Database wird zur Runtime initialisiert');
}

/**
 * Globale Variable zum Speichern der Verbindung
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Build-sichere Verbindung zur MongoDB-Datenbank
 * @returns {Promise<Mongoose>} - Eine Mongoose-Instanz oder null
 */
async function connectDB() {
  // ✅ Runtime-Check: Falls MONGODB_URI fehlt
  if (!MONGODB_URI) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Entwicklungsmodus: MONGODB_URI nicht gefunden, simuliere Datenbankverbindung.');
      return { connection: { readyState: 1 } };
    } else {
      // ✅ Graceful handling in Produktion
      console.error('❌ MONGODB_URI fehlt in Produktion');
      return null;
    }
  }

  // ✅ Bereits verbunden
  if (cached.conn) {
    return cached.conn;
  }

  // ✅ Verbindung aufbauen
  if (!cached.promise) {
    const opts = {
      // ✅ Deprecated Options entfernt
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB-Verbindung hergestellt');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ Fehler bei der MongoDB-Verbindung:', error);
        cached.promise = null; // Reset bei Fehler
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // ✅ Graceful error handling
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ MongoDB-Verbindung fehlgeschlagen. Simuliere Verbindung für Entwicklung.');
      return { connection: { readyState: 1 } };
    }
    
    // ✅ In Produktion null zurückgeben statt crashen
    console.error('❌ MongoDB-Verbindung fehlgeschlagen:', error.message);
    return null;
  }
}

export default connectDB;