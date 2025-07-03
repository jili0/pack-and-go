// src/lib/fileUpload.js
import { v4 as uuidv4 } from "uuid";
import * as common from "oci-common";
import * as objectStorage from "oci-objectstorage";
import fs from "fs";

// Oracle Object Storage config from env
const tenancyId = process.env.ORACLE_CLOUD_TENANCY_OCID;
const userId = process.env.ORACLE_CLOUD_USER_OCID;
const fingerprint = process.env.ORACLE_CLOUD_KEY_FINGERPRINT;
const privateKeyBase64 = process.env.ORACLE_PRIVATE_KEY_BASE64;
const region = process.env.ORACLE_CLOUD_REGION;
const bucketName = process.env.ORACLE_CLOUD_BUCKET_NAME;
const namespaceName = process.env.ORACLE_CLOUD_NAMESPACE;
const compartmentId = process.env.ORACLE_CLOUD_COMPARTMENT_OCID;

// Region mapping for Oracle SDK
const regionMapping = {
  "eu-frankfurt-1": "eu-frankfurt-1",
  "us-ashburn-1": "us-ashburn-1",
  "us-phoenix-1": "us-phoenix-1",
  "ap-tokyo-1": "ap-tokyo-1",
  "ap-singapore-1": "ap-singapore-1",
};

const mappedRegion = regionMapping[region] || region;

console.log("Oracle Cloud Config:", {
  tenancyId: tenancyId ? "SET" : "MISSING",
  userId: userId ? "SET" : "MISSING",
  fingerprint: fingerprint ? "SET" : "MISSING",
  privateKeyBase64: privateKeyBase64 ? "SET" : "MISSING",
  region: region,
  bucketName: bucketName ? "SET" : "MISSING",
  namespaceName: namespaceName ? "SET" : "MISSING",
  compartmentId: compartmentId ? "SET" : "MISSING",
});

// Validate required environment variables
const requiredEnvVars = {
  tenancyId,
  userId,
  fingerprint,
  privateKeyBase64,
  region,
  bucketName,
  namespaceName,
  compartmentId,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(
    "Missing required Oracle Cloud environment variables:",
    missingVars
  );
  throw new Error(
    `Missing Oracle Cloud configuration: ${missingVars.join(", ")}`
  );
}

let provider;
let client;

try {
  console.log("=== ORACLE STORAGE DEBUG START ===");
  console.log("1. Environment variables check:", {
    tenancyId: tenancyId ? "SET" : "MISSING",
    userId: userId ? "SET" : "MISSING",
    fingerprint: fingerprint ? "SET" : "MISSING",
    privateKeyBase64: privateKeyBase64 ? "SET" : "MISSING",
    region: region,
    bucketName: bucketName ? "SET" : "MISSING",
    namespaceName: namespaceName ? "SET" : "MISSING",
    compartmentId: compartmentId ? "SET" : "MISSING",
  });

  console.log("2. Private key file check:", {
    exists: fs.existsSync(privateKeyBase64),
    base64: privateKeyBase64,
  });

  console.log("3. Creating provider...");
  console.log("3a. Using fingerprint:", fingerprint);
  console.log("3b. Using userId:", userId);
  console.log("3c. Using tenancyId:", tenancyId);
  console.log("3d. Using compartmentId:", compartmentId);
  provider = new common.SimpleAuthenticationDetailsProvider(
    tenancyId,
    userId,
    fingerprint,
    Buffer.from(privateKeyBase64, "base64").toString("utf8"),
    null,
    compartmentId
  );
  console.log("4. Provider created successfully");

  console.log("5. Creating client...");
  // Use the correct Oracle SDK Region class
  let oracleRegion;
  try {
    console.log("5a1. Attempting to create region with fromRegionId...");
    oracleRegion = common.Region.fromRegionId(region);
    console.log("5a2. Region created successfully with fromRegionId");
  } catch (error) {
    console.log("5a3. fromRegionId failed, using fallback:", error.message);
    // Fallback: create region manually with proper structure
    oracleRegion = {
      regionId: region,
      realm: {
        secondLevelDomain: "oraclecloud.com",
        realmId: "oc1",
      },
    };
    console.log("5a4. Fallback region created");
  }
  console.log("5a. Oracle region object:", oracleRegion);
  console.log("5a5. Region type:", typeof oracleRegion);
  console.log("5a6. Region constructor:", oracleRegion.constructor.name);

  // Create client without region first, then set endpoint manually
  console.log("5b. About to create ObjectStorageClient...");
  console.log("5b1. Provider type:", typeof provider);
  console.log("5b2. Provider constructor:", provider.constructor.name);

  try {
    client = new objectStorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });
    console.log("5b3. ObjectStorageClient created successfully");
  } catch (clientError) {
    console.error("5b4. ObjectStorageClient creation failed:", clientError);
    throw clientError;
  }

  // Set endpoint manually
  console.log("5c. Setting endpoint manually...");
  client.endpoint = `https://objectstorage.${region}.oraclecloud.com`;
  console.log("5c1. Endpoint set successfully");

  console.log("6. Client created successfully");
  console.log("7. Client endpoint:", client.endpoint);
  console.log("=== ORACLE STORAGE DEBUG END ===");
} catch (error) {
  console.error("=== ORACLE STORAGE INIT ERROR ===");
  console.error("Error step:", error.message);
  console.error("Full error:", error);
  console.error("=== ORACLE STORAGE INIT ERROR END ===");
  throw new Error("Failed to initialize Oracle Object Storage client");
}

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
  console.log("=== UPLOAD DEBUG START ===");
  console.log("1. File info:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  const fileExtension = file.name.split(".").pop();
  const filename = `${type}_${accountId}_${uuidv4()}.${fileExtension}`;
  console.log("2. Generated filename:", filename);

  console.log("3. Converting file to buffer...");
  const buffer = Buffer.from(await file.arrayBuffer());
  console.log("4. Buffer created, size:", buffer.length);

  const putObjectRequest = {
    namespaceName,
    bucketName,
    objectName: `uploads/${filename}`,
    putObjectBody: buffer,
    contentType: file.type,
  };
  console.log("5. PutObjectRequest created:", {
    namespaceName,
    bucketName,
    objectName: putObjectRequest.objectName,
    contentType: putObjectRequest.contentType,
  });

  try {
    console.log("6. Starting putObject request...");
    await client.putObject(putObjectRequest);
    console.log("7. putObject request completed successfully");

    // Use Oracle SDK's endpoint to construct URL
    const endpoint = client.endpoint;
    console.log("8. Client endpoint:", endpoint);

    // Construct URL using the endpoint
    const publicUrl = `${endpoint}/n/${namespaceName}/b/${bucketName}/o/uploads%2F${encodeURIComponent(filename)}`;
    console.log("9. Generated public URL:", publicUrl);
    console.log("=== UPLOAD DEBUG END ===");
    return publicUrl;
  } catch (error) {
    console.error("=== UPLOAD ERROR ===");
    console.error("Error during putObject:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
    });
    console.error("=== UPLOAD ERROR END ===");
    throw error;
  }
};
