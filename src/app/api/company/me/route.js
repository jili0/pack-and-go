// src/app/api/company/me/route.js
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

    // Find the company based on user ID
    let company = await Company.findOne({ accountId: session.id });

    // If no company profile exists, create one automatically
    if (!company) {
      console.log("🏢 No company profile found, creating one automatically");
      
      // Get account data for initial setup
      const account = await Account.findById(session.id).select("-password");
      
      if (!account) {
        return NextResponse.json(
          { success: false, message: "Account not found" },
          { status: 404 }
        );
      }

      // Create company profile with account name as initial company name
      company = await Company.create({
        accountId: session.id,
        companyName: account.name,
        description: "",
        address: "",
        serviceAreas: [],
      });
      
      console.log("✓ Company profile created automatically");
    }

    // Get the user data
    const account = await Account.findById(session.id).select("-password");

    return NextResponse.json(
      {
        success: true,
        company: company.toObject(),
        account: account.toObject(),
        isNewProfile: !company.description && !company.address, // Indicate if profile needs setup
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving company profile:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while retrieving company profile",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "company") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const updateData = await request.json();

    // Find the company
    const company = await Company.findOne({ accountId: session.id });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company profile not found" },
        { status: 404 }
      );
    }

    // Allowed fields for updates
    const allowedFields = [
      "companyName",
      "description",
      "address",
      "serviceAreas",
    ];

    // Filter only allowed fields
    const filteredUpdate = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdate[key] = updateData[key];
      }
    });

    // Update the company
    const updatedCompany = await Company.findByIdAndUpdate(
      company._id,
      { $set: filteredUpdate },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Company profile successfully updated",
        company: updatedCompany.toObject(),
      },
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