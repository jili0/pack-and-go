// src/lib/fileUpload.js
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Konfiguriere den S3-Client mit den Umgebungsvariablen
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Speichert eine hochgeladene Datei im Speicher (S3)
 * @param {File} file - Die hochgeladene Datei
 * @param {string} type - Der Dateityp (z.B. 'businessLicense', 'kisteKlarCertificate')
 * @param {string} accountId - Die ID des Benutzers
 * @returns {Promise<string>} - URL zur gespeicherten Datei
 */
export const saveUploadedFile = async (file, type, accountId) => {
  console.log("Empfangene Datei:", file);
  try {
    // Generiere einen eindeutigen Dateinamen
    const fileExtension = file.name.split(".").pop();
    const filename = `${type}_${accountId}_${uuidv4()}.${fileExtension}`;

    // Lese die Datei als Buffer/ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Konfiguriere den S3-Upload
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `documents/${filename}`,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      ACL: "private", // Für private Dokumente
    };

    // Führe den Upload durch
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Generiere die URL zur gespeicherten Datei
    // Im Produktionscode sollte hier ein signierter URL generiert werden
    const fileUrl = `${process.env.AWS_S3_BASE_URL}/documents/${filename}`;

    return fileUrl;
  } catch (error) {
    console.error("Fehler beim Speichern der Datei:", error);
    throw error;
  }
};

/**
 * Generiert einen signierten URL für ein Dokument
 * @param {string} documentUrl - Die URL zum Dokument
 * @param {number} expirationTime - Die Ablaufzeit in Sekunden
 * @returns {Promise<string>} - Der signierte URL
 */
export const generateSignedUrl = async (documentUrl, expirationTime = 3600) => {
  try {
    const key = documentUrl.split("/").pop();
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `documents/${key}`,
      Expires: expirationTime,
    };

    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expirationTime,
    });

    return signedUrl;
  } catch (error) {
    console.error("Fehler beim Generieren des signierten URLs:", error);
    throw error;
  }
};

/**
 * Löscht eine Datei aus dem Speicher
 * @param {string} documentUrl - Die URL zur Datei
 * @returns {Promise<void>}
 */
export const deleteFile = async (documentUrl) => {
  try {
    const key = documentUrl.split("/").pop();
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `documents/${key}`,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error("Fehler beim Löschen der Datei:", error);
    throw error;
  }
};

export const saveUploadedFileLocal = async (file, type, accountId) => {
  try {
    // Generiere einen eindeutigen Dateinamen
    const fileExtension = file.name.split(".").pop();
    const filename = `${type}_${accountId}_${Date.now()}.${fileExtension}`;

    // Simuliere erfolgreichen Upload
    const fileUrl = `/uploads/${filename}`;

    console.log(`[DEV] Datei simuliert gespeichert: ${filename}`);

    return fileUrl;
  } catch (error) {
    console.error("Fehler beim lokalen Speichern:", error);
    throw error;
  }
};

// Verwende die entsprechende Implementierung je nach Umgebung
export default process.env.NODE_ENV === "development"
  ? saveUploadedFileLocal
  : saveUploadedFile;
