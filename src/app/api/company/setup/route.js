// src/app/api/company/setup/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";

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

    // Get existing company profile
    const company = await Company.findOne({ accountId: session.id });
    const account = await Account.findById(session.id).select("-password");

    return NextResponse.json(
      {
        success: true,
        company: company?.toObject() || null,
        account: account?.toObject() || null,
        hasCompanyProfile: !!company,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching company setup data:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching company data",
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

    const setupData = await request.json();
    const { 
      companyName, 
      description, 
      address, 
      serviceAreas,
      phone,
      email,
      taxId,
      isKisteKlarCertified 
    } = setupData;

    // Validate required fields
    if (!companyName) {
      return NextResponse.json(
        { success: false, message: "Company name is required" },
        { status: 400 }
      );
    }

    // Check if company profile already exists
    const existingCompany = await Company.findOne({ accountId: session.id });

    if (existingCompany) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Company profile already exists. Use the profile update endpoint instead." 
        },
        { status: 400 }
      );
    }

    // Create initial company profile with basic information
    const companyData = {
      accountId: session.id,
      companyName,
      description: description || "",
      address: address || "",
      serviceAreas: serviceAreas || [],
      phone: phone || "",
      email: email || "",
      taxId: taxId || "",
      isKisteKlarCertified: isKisteKlarCertified || false,
      isVerified: false,
      documents: {
        businessLicense: { verified: false },
        kisteKlarCertificate: { verified: false },
      },
    };

    // Create the company profile
    const company = new Company(companyData);
    await company.save();

    return NextResponse.json(
      {
        success: true,
        message: "Company profile created successfully",
        company: company.toObject(),
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