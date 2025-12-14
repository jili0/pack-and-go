import fs from "fs";
import path from "path";

/**
 * Deletes a file from local storage
 * @param {string} fileUrl - The URL of the file to delete (e.g., /uploads/kisteklar/filename.pdf)
 * @returns {Promise<void>}
 */
export async function deleteFile(fileUrl) {
  try {
    if (!fileUrl) {
      console.warn("deleteFile: No file URL provided");
      return;
    }

    // Remove leading slash and build full path
    // fileUrl is like /uploads/kisteklar/filename.pdf
    // We need to convert it to public/uploads/kisteklar/filename.pdf
    const filePath = path.join(process.cwd(), "public", fileUrl);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted successfully: ${filePath}`);
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${fileUrl}:`, error);
    // Don't throw - we don't want file deletion failures to break the flow
    // Log the error but continue with the account deletion
  }
}

