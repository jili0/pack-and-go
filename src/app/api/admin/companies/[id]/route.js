import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import { getSession } from "@/lib/auth";

/**
 * PUT handler to update company data
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    // Check if account is authenticated and is admin
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const updateData = await request.json();

    // Find and update company
    const updatedCompany = await Company.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCompany) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update company data" },
      { status: 500 }
    );
  }
}

/**
 * GET handler to retrieve company data
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Check if account is authenticated and is admin
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const company = await Company.findById(id);

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Error retrieving company:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve company data" },
      { status: 500 }
    );
  }
}
