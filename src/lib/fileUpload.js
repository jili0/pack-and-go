// src/lib/fileUpload.js
import { v4 as uuidv4 } from "uuid";
import * as common from "oci-common";
import * as objectStorage from "oci-objectstorage";
import fs from "fs";

// Oracle Object Storage config from env
const tenancyId = process.env.ORACLE_CLOUD_TENANCY_OCID;
const userId = process.env.ORACLE_CLOUD_USER_OCID;
const fingerprint = process.env.ORACLE_CLOUD_KEY_FINGERPRINT;
const privateKeyPath = process.env.ORACLE_CLOUD_PRIVATE_KEY_PATH;
const region = process.env.ORACLE_CLOUD_REGION;
const bucketName = process.env.ORACLE_CLOUD_BUCKET_NAME;
const namespaceName = process.env.ORACLE_CLOUD_NAMESPACE;

const provider = new common.SimpleAuthenticationDetailsProvider(
  tenancyId,
  userId,
  fingerprint,
  fs.readFileSync(privateKeyPath, "utf8"),
  null,
  region
);

const client = new objectStorage.ObjectStorageClient({
  authenticationDetailsProvider: provider,
});

/**
 * Uploads a file to Oracle Object Storage and returns the public URL
 * @param {File} file - The uploaded file (from formData)
 * @param {string} type - File type/category (e.g. 'photo-inventory')
 * @param {string} [accountId] - Optional user/account id
 * @returns {Promise<string>} - Public URL to the uploaded file
 */
export const uploadToOracleObjectStorage = async (
  file,
  type = "photo-inventory",
  accountId = ""
) => {
  const fileExtension = file.name.split(".").pop();
  const filename = `${type}_${accountId}_${uuidv4()}.${fileExtension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const putObjectRequest = {
    namespaceName,
    bucketName,
    objectName: `uploads/${filename}`,
    putObjectBody: buffer,
    contentType: file.type,
  };

  await client.putObject(putObjectRequest);

  // Public URL (if bucket is public) or for signed URL logic
  const publicUrl = `https://objectstorage.${region}.oraclecloud.com/n/${namespaceName}/b/${bucketName}/o/uploads%2F${encodeURIComponent(filename)}`;
  return publicUrl;
};
