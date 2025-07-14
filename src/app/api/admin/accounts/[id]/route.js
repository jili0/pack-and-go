import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Account from "@/models/Account";
import Company from "@/models/Company";
import Order from "@/models/Order";
import Review from "@/models/Review";
import { getSession } from "@/lib/auth";

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

    // Find account by ID
    const account = await Account.findById(id)
      .select("-password") // Exclude password field
      .populate("orders")
      .populate("reviews");

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    // If account is a company, get company details
    let companyDetails = null;
    if (account.role === "company") {
      companyDetails = await Company.findOne({ accountId: account._id });
    }

    return NextResponse.json(
      {
        success: true,
        account,
        companyDetails,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving account:", error);

    return NextResponse.json(
      { success: false, message: "Server error while retrieving account" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
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

    const { action, role, ...updateData } = await request.json();

    // Find the account
    const account = await Account.findById(id);

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    let updatedAccount;

    switch (action) {
      case "changeRole":
        // Validate role
        const validRoles = ["user", "company", "admin"];
        if (!role || !validRoles.includes(role)) {
          return NextResponse.json(
            { success: false, message: "Invalid role specified" },
            { status: 400 }
          );
        }

        // Prevent changing the current admin's role
        if (account._id.toString() === session.id && role !== "admin") {
          return NextResponse.json(
            { success: false, message: "Cannot change your own admin role" },
            { status: 400 }
          );
        }

        updatedAccount = await Account.findByIdAndUpdate(
          id,
          { role },
          { new: true }
        ).select("-password");

        break;

      case "suspend":
        // Add suspended field or update status
        updatedAccount = await Account.findByIdAndUpdate(
          id,
          { suspended: true, suspendedAt: new Date() },
          { new: true }
        ).select("-password");

        break;

      case "unsuspend":
        // Remove suspended status
        updatedAccount = await Account.findByIdAndUpdate(
          id,
          { $unset: { suspended: 1, suspendedAt: 1 } },
          { new: true }
        ).select("-password");

        break;

      case "updateProfile":
        // Update account profile information
        const allowedFields = ["name", "phone"];
        const filteredData = {};

        Object.keys(updateData).forEach((key) => {
          if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
          }
        });

        updatedAccount = await Account.findByIdAndUpdate(id, filteredData, {
          new: true,
        }).select("-password");

        break;

      case "changePassword":
        const { newPassword } = updateData;

        if (!newPassword || newPassword.length < 6) {
          return NextResponse.json(
            {
              success: false,
              message: "Password must be at least 6 characters long",
            },
            { status: 400 }
          );
        }

        const bcryptjs = require("bcryptjs");
        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(newPassword, saltRounds);

        updatedAccount = await Account.findByIdAndUpdate(
          id,
          {
            password: hashedPassword,
            passwordChangedAt: new Date(),
            requirePasswordChange: false,
          },
          { new: true }
        ).select("-password");

        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action specified" },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Account ${action} completed successfully`,
        account: updatedAccount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating account:", error);

    return NextResponse.json(
      { success: false, message: "Server error while updating account" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    // Find the account
    const account = await Account.findById(id);

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    // Prevent deleting the current admin
    if (account._id.toString() === session.id) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // If account is a company, clean up company data
    if (account.role === "company") {
      const company = await Company.findOne({ accountId: id });
      if (company) {
        // Update orders to mark company as deleted but keep historical data
        await Order.updateMany(
          { companyId: company._id },
          { $set: { companyDeleted: true } }
        );

        // Delete company record
        await Company.findByIdAndDelete(company._id);
      }
    }

    // Update orders to mark account as deleted but keep historical data
    await Order.updateMany({ accountId: id }, { $set: { accountDeleted: true } });

    // Delete the account
    await Account.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);

    return NextResponse.json(
      { success: false, message: "Server error while deleting account" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';