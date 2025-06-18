// src/app/api/company/setup/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";
import saveUploadedFile from "@/lib/fileUpload";

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

    // Check if company profile already exists
    const existingCompany = await Company.findOne({ accountId: session.id });

    if (existingCompany) {
      return NextResponse.json(
        {
          success: false,
          message: "A company profile already exists for this user",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Extract form data
    const companyName = formData.get("companyName");
    const taxId = formData.get("taxId");
    const street = formData.get("street");
    const city = formData.get("city");
    const postalCode = formData.get("postalCode");
    const country = formData.get("country") || "Germany";
    const isKisteKlarCertified = formData.get("isKisteKlarCertified") === "true";

    // Extract service areas
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
          message: "All required fields must be filled out",
        },
        { status: 400 }
      );
    }

    // Process uploaded files
    const businessLicenseFile = formData.get("businessLicense");
    const kisteKlarCertificateFile = formData.get("kisteKlarCertificate");

    let businessLicenseUrl = null;
    let kisteKlarCertificateUrl = null;

    if (businessLicenseFile) {
      businessLicenseUrl = await saveUploadedFile(
        businessLicenseFile,
        "businessLicense",
        session.id
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Business license is required" },
        { status: 400 }
      );
    }

    if (isKisteKlarCertified && kisteKlarCertificateFile) {
      kisteKlarCertificateUrl = await saveUploadedFile(
        kisteKlarCertificateFile,
        "kisteKlarCertificate",
        session.id
      );
    } else if (isKisteKlarCertified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "KisteKlar certificate is required when claiming to be certified",
        },
        { status: 400 }
      );
    }

    // Create company profile
    const newCompany = await Company.create({
      accountId: session.id,
      companyName,
      address: {
        street,
        city,
        postalCode,
        country,
      },
      taxId,
      serviceAreas,
      isVerified: false, // Must be confirmed by an administrator
      isKisteKlarCertified,
      documents: {
        businessLicense: {
          url: businessLicenseUrl,
          verified: false,
        },
        ...(kisteKlarCertificateUrl
          ? {
              kisteKlarCertificate: {
                url: kisteKlarCertificateUrl,
                verified: false,
              },
            }
          : {}),
      },
    });

    const account = await Account.findById(session.id);

    return NextResponse.json(
      {
        success: true,
        message:
          "Company profile successfully created and submitted for review",
        company: newCompany,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating company profile:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while creating company profile",
      },
      { status: 500 }
    );
  }
}