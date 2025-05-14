// src/lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Bitte definieren Sie die MONGODB_URI-Umgebungsvariable in Ihrer .env.local-Datei'
  );
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

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;