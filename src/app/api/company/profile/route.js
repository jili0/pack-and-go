// Complete solution for fixing company profile issues

// 1. Fix the existing /api/company/profile route (from your first document)
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";
import { uploadToOracleObjectStorage } from "@/lib/fileUpload";

export async function GET() {
  try {
    console.log("🔍 GET /api/company/profile - Starting");
    
    const session = await getSession();
    console.log("🔍 Session:", session);

    if (!session || session.role !== "company") {
      console.log("❌ Not authorized - session:", session);
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();
    console.log("✓ Database connected");

    let company = await Company.findOne({ accountId: session.id });
    console.log("🔍 Company found:", !!company);

    if (!company) {
      console.log("❌ Company profile not found for user:", session.id);
      return NextResponse.json(
        { success: false, message: "Company profile not found" },
        { status: 404 }
      );
    }

    const account = await Account.findById(session.id).select("-password");
    console.log("🔍 Account found:", !!account);

    return NextResponse.json(
      {
        success: true,
        company: company.toObject(),
        account: account.toObject(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching company profile:", error);

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
    console.log("🔍 POST /api/company/profile - Starting");
    
    const session = await getSession();
    console.log("🔍 Session:", session);

    if (!session || session.role !== "company") {
      console.log("❌ Not authorized");
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();
    console.log("✓ Database connected");

    const formData = await request.formData();
    console.log("🔍 FormData keys:", Array.from(formData.keys()));

    const companyName = formData.get("companyName");
    const taxId = formData.get("taxId");
    const street = formData.get("street");
    const city = formData.get("city");
    const postalCode = formData.get("postalCode");
    const country = formData.get("country") || "Germany";
    const phone = formData.get("phone") || "";
    const email = formData.get("email") || "";
    const isKisteKlarCertified = formData.get("isKisteKlarCertified") === "true";

    console.log("🔍 Extracted data:", {
      companyName,
      taxId,
      street,
      city,
      postalCode,
      country,
      phone,
      email,
      isKisteKlarCertified,
    });

    const serviceAreasData = formData.get("serviceAreas");
    let serviceAreas = [];

    if (serviceAreasData) {
      try {
        serviceAreas = JSON.parse(serviceAreasData);
      } catch (error) {
        console.error("❌ Error parsing service areas:", error);
        return NextResponse.json(
          { success: false, message: "Invalid format for service areas" },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!companyName || !taxId || !street || !city || !postalCode) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be filled out",
        },
        { status: 400 }
      );
    }

    const businessLicenseFile = formData.get("businessLicense");
    const kisteKlarCertificateFile = formData.get("kisteKlarCertificate");

    const existingCompany = await Company.findOne({ accountId: session.id });
    console.log("🔍 Existing company:", !!existingCompany);

    let businessLicenseUrl = existingCompany?.documents?.businessLicense?.url || null;
    let kisteKlarCertificateUrl = existingCompany?.documents?.kisteKlarCertificate?.url || null;

    // Handle file uploads
    if (businessLicenseFile) {
      try {
        businessLicenseUrl = await uploadToOracleObjectStorage(
          businessLicenseFile,
          "businessLicense",
          session.id
        );
        console.log("✓ Business license uploaded:", businessLicenseUrl);
      } catch (error) {
        console.error("❌ Error uploading business license:", error);
        return NextResponse.json(
          { success: false, message: "Error uploading business license" },
          { status: 500 }
        );
      }
    } else if (!existingCompany) {
      console.log("❌ Business license required for new company");
      return NextResponse.json(
        { success: false, message: "Business license is required" },
        { status: 400 }
      );
    }

    if (isKisteKlarCertified && kisteKlarCertificateFile) {
      try {
        kisteKlarCertificateUrl = await uploadToOracleObjectStorage(
          kisteKlarCertificateFile,
          "kisteKlarCertificate",
          session.id
        );
        console.log("✓ KisteKlar certificate uploaded:", kisteKlarCertificateUrl);
      } catch (error) {
        console.error("❌ Error uploading KisteKlar certificate:", error);
        return NextResponse.json(
          { success: false, message: "Error uploading KisteKlar certificate" },
          { status: 500 }
        );
      }
    } else if (isKisteKlarCertified && !existingCompany) {
      console.log("❌ KisteKlar certificate required");
      return NextResponse.json(
        {
          success: false,
          message: "KisteKlar certificate is required when claiming to be certified",
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
        businessLicense: {
          url: businessLicenseUrl,
          verified: existingCompany?.documents?.businessLicense?.verified || false,
        },
        ...(kisteKlarCertificateUrl ? {
          kisteKlarCertificate: {
            url: kisteKlarCertificateUrl,
            verified: existingCompany?.documents?.kisteKlarCertificate?.verified || false,
          },
        } : {}),
      },
    };

    // Only set isVerified to false for new companies
    if (!existingCompany) {
      companyData.isVerified = false;
    }

    console.log("🔍 Company data to save:", companyData);

    const updatedCompany = await Company.findOneAndUpdate(
      { accountId: session.id },
      { $set: companyData },
      { new: true, upsert: true }
    );

    console.log("✓ Company saved successfully");

    return NextResponse.json(
      {
        success: true,
        message: existingCompany
          ? "Company profile updated successfully"
          : "Company profile created successfully and submitted for review",
        company: updatedCompany.toObject(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating company profile:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while updating company profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}