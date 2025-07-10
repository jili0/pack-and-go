import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";
// Oracle-Import entfernt
// import { uploadToOracleObjectStorage } from "@/lib/fileUpload";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "company") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const company = await Company.findOne({ accountId: session.id });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company profile not found" },
        { status: 404 }
      );
    }

    const account = await Account.findById(session.id).select("-password");

    return NextResponse.json(
      {
        success: true,
        company: company.toObject(),
        account: account.toObject(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching company profile:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching company profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "company") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await request.formData();

    const companyName = formData.get("companyName");
    const taxId = formData.get("taxId");
    const street = formData.get("street");
    const city = formData.get("city");
    const postalCode = formData.get("postalCode");
    const country = formData.get("country") || "Germany";
    const phone = formData.get("phone") || "";
    const email = formData.get("email") || "";
    const isKisteKlarCertified =
      formData.get("isKisteKlarCertified") === "true";

    const serviceAreasData = formData.get("serviceAreas");
    let serviceAreas = [];

    if (serviceAreasData) {
      try {
        serviceAreas = JSON.parse(serviceAreasData);
      } catch (error) {
        return NextResponse.json(
          { success: false, message: "Invalid format for service areas" },
          { status: 400 }
        );
      }
    }

    if (!companyName || !taxId || !street || !city || !postalCode) {
      return NextResponse.json(
        {
          success: false,
          message: `All required fields must be filled out: companyName: ${companyName}, taxId: ${taxId}, street: ${street}, city: ${city}, postalCode: ${postalCode}`,
        },
        { status: 400 }
      );
    }

    const kisteKlarCertificateFile = formData.get("kisteKlarCertificate");

    const existingCompany = await Company.findOne({ accountId: session.id });

    let kisteKlarCertificateUrl =
      existingCompany?.documents?.kisteKlarCertificate?.url || null;

    // KisteKlar Certificate Upload: lokale Lösung
    if (isKisteKlarCertified && kisteKlarCertificateFile) {
      // Speichere Datei lokal im Verzeichnis 'public/uploads/kisteklar/'
      const arrayBuffer = await kisteKlarCertificateFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fs = require("fs");
      const path = require("path");
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "kisteklar"
      );
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `${session.id}_kisteklar_${Date.now()}_${kisteKlarCertificateFile.name}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      kisteKlarCertificateUrl = `/uploads/kisteklar/${filename}`;
    } else if (isKisteKlarCertified && !existingCompany) {
      return NextResponse.json(
        {
          success: false,
          message:
            "KisteKlar certificate is required when claiming to be certified",
        },
        { status: 400 }
      );
    }

    const companyData = {
      accountId: session.id,
      companyName,
      address: {
        street,
        city,
        postalCode,
        country,
      },
      taxId,
      phone,
      email,
      serviceAreas,
      isKisteKlarCertified,
      documents: {
        ...(kisteKlarCertificateUrl
          ? {
              kisteKlarCertificate: {
                url: kisteKlarCertificateUrl,
                verified:
                  existingCompany?.documents?.kisteKlarCertificate?.verified ||
                  false,
              },
            }
          : {}),
      },
    };

    if (!existingCompany) {
      companyData.isVerified = false;
    }

    const updatedCompany = await Company.findOneAndUpdate(
      { accountId: session.id },
      { $set: companyData },
      { new: true, upsert: true }
    );

    return NextResponse.json(
      { success: true, company: updatedCompany },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while updating company profile",
      },
      { status: 500 }
    );
  }
}
