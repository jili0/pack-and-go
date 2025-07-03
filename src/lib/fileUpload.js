import { v4 as uuidv4 } from "uuid";

const isVercel = process.env.VERCEL === '1';

// Separate Implementierungen definieren
let uploadImplementation;
let deleteImplementation;

if (isVercel) {
  // Vercel: Kein Oracle SDK (Build-Probleme vermeiden)
  console.log("Running on Vercel - Oracle SDK disabled");
  
  uploadImplementation = async () => {
    throw new Error('File uploads not supported on Vercel deployment. Use Oracle Cloud deployment for file operations.');
  };

  deleteImplementation = async () => {
    throw new Error('File operations not supported on Vercel deployment. Use Oracle Cloud deployment for file operations.');
  };
} else {
  // Oracle Cloud Docker + Local: Vollständige Oracle SDK Implementation
  
  // Dynamic imports nur zur Runtime
  let common, objectStorage, fs;
  
  const initializeModules = async () => {
    if (!common) {
      common = await import("oci-common");
      objectStorage = await import("oci-objectstorage");
      fs = await import("fs");
    }
    return { common, objectStorage, fs };
  };

  // Oracle Object Storage config from env
  const tenancyId = process.env.ORACLE_CLOUD_TENANCY_OCID;
  const userId = process.env.ORACLE_CLOUD_USER_OCID;
  const fingerprint = process.env.ORACLE_CLOUD_KEY_FINGERPRINT;
  const privateKeyBase64 = process.env.ORACLE_PRIVATE_KEY_BASE64;
  const region = process.env.ORACLE_CLOUD_REGION;
  const bucketName = process.env.ORACLE_CLOUD_BUCKET_NAME;
  const namespaceName = process.env.ORACLE_CLOUD_NAMESPACE;
  const compartmentId = process.env.ORACLE_CLOUD_COMPARTMENT_OCID;



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
    console.error("Missing required Oracle Cloud environment variables:", missingVars);
    throw new Error(`Missing Oracle Cloud configuration: ${missingVars.join(", ")}`);
  }

  // Lazy client initialization
  let clientPromise = null;

  const getOracleClient = async () => {
    if (clientPromise) return clientPromise;
    
    clientPromise = (async () => {
      try {
        const { common, objectStorage, fs } = await initializeModules();
        
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
        
        const provider = new common.SimpleAuthenticationDetailsProvider(
          tenancyId,
          userId,
          fingerprint,
          Buffer.from(privateKeyBase64, "base64").toString("utf8"),
          null,
          compartmentId
        );
        console.log("4. Provider created successfully");

        console.log("5. Creating client...");
        
        // Create client with manual endpoint (avoid region object issues)
        const client = new objectStorage.ObjectStorageClient({
          authenticationDetailsProvider: provider,
        });
        
        // Set endpoint manually to avoid region object issues
        client.endpoint = `https://objectstorage.${region}.oraclecloud.com`;
        
        console.log("6. Client created successfully");
        console.log("7. Client endpoint:", client.endpoint);
        console.log("=== ORACLE STORAGE DEBUG END ===");
        
        return client;
      } catch (error) {
        console.error("=== ORACLE STORAGE INIT ERROR ===");
        console.error("Error step:", error.message);
        console.error("Full error:", error);
        console.error("=== ORACLE STORAGE INIT ERROR END ===");
        throw new Error("Failed to initialize Oracle Object Storage client");
      }
    })();

    return clientPromise;
  };

  /**
   * Uploads a file to Oracle Object Storage and returns the public URL
   */
  uploadImplementation = async (
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
      const client = await getOracleClient();
      
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

  /**
   * Löscht eine Datei (Object) aus Oracle Object Storage anhand der URL
   */
  deleteImplementation = async (fileUrl) => {
    try {
      const client = await getOracleClient();
      
      // Extrahiere den Object Key aus der URL
      // Beispiel-URL: https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/namespace/b/bucket/o/uploads%2Ffilename.pdf
      const match = fileUrl.match(/\/o\/(.+)$/);
      if (!match || !match[1]) {
        throw new Error("Invalid Oracle Object Storage URL: " + fileUrl);
      }
      // Oracle encodiert / als %2F im Object Key
      const objectName = decodeURIComponent(match[1]);
      const deleteObjectRequest = {
        namespaceName,
        bucketName,
        objectName,
      };
      await client.deleteObject(deleteObjectRequest);
      console.log(`Deleted object from Oracle Object Storage: ${objectName}`);
    } catch (error) {
      console.error("Error deleting object from Oracle Object Storage:", error);
      throw error;
    }
  };
}

// Exports außerhalb der conditional logic
export const uploadToOracleObjectStorage = uploadImplementation;
export const deleteFile = deleteImplementation;