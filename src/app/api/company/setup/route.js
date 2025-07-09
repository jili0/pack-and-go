// src/app/api/company/setup/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";

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
        { success: false, message: "Company profile already exists" },
        { status: 400 }
      );
    }

    const setupData = await request.json();
    const { companyName, description, address, serviceAreas } = setupData;

    // Validate required fields
    if (!companyName) {
      return NextResponse.json(
        { success: false, message: "Company name is required" },
        { status: 400 }
      );
    }

    // Create company profile
    const newCompany = await Company.create({
      accountId: session.id,
      companyName,
      description: description || "",
      address: address || "",
      serviceAreas: serviceAreas || [],
    });

    // Get account data
    const account = await Account.findById(session.id).select("-password");

    return NextResponse.json(
      {
        success: true,
        message: "Company profile created successfully",
        company: newCompany.toObject(),
        account: account.toObject(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error setting up company profile:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while setting up company profile",
      },
      { status: 500 }
    );
  }
}