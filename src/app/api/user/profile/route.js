// src/app/api/user/profile/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import { getSession } from "@/lib/auth";
import bcryptjs from "bcryptjs";

/**
 * GET handler to retrieve current user's profile
 * @returns {Promise<NextResponse>} JSON response with user profile data
 */
export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find user by session ID
    const user = await User.findById(session.id)
      .select("-password") // Exclude password field
      .lean(); // Convert to plain object for better performance

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // If user is a company, get company details
    let companyDetails = null;
    if (user.role === "company") {
      companyDetails = await Company.findOne({ userId: user._id }).lean();
    }

    return NextResponse.json(
      {
        success: true,
        user,
        companyDetails,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving user profile:", error);

    return NextResponse.json(
      { success: false, message: "Server error while retrieving profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update current user's profile
 * @returns {Promise<NextResponse>} JSON response with success/failure message
 */
export async function PUT(request) {
  try {
    // Check if user is authenticated
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the user
    const user = await User.findById(session.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { name, phone, currentPassword, newPassword } = await request.json();

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[0-9\s\-()]{8,}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      phone: phone.trim(),
      updatedAt: new Date(),
    };

    // Handle password change if provided
    if (currentPassword && newPassword) {
      // Validate current password
      const isCurrentPasswordValid = await bcryptjs.compare(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "New password must be at least 6 characters long",
          },
          { status: 400 }
        );
      }

      // Check if new password is different from current password
      const isSamePassword = await bcryptjs.compare(newPassword, user.password);
      if (isSamePassword) {
        return NextResponse.json(
          {
            success: false,
            message: "New password must be different from current password",
          },
          { status: 400 }
        );
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcryptjs.hash(newPassword, saltRounds);

      updateData.password = hashedPassword;
      updateData.passwordChangedAt = new Date();
    } else if (currentPassword || newPassword) {
      // If only one password field is provided
      return NextResponse.json(
        {
          success: false,
          message: "Both current password and new password are required to change password",
        },
        { status: 400 }
      );
    }

    // Check if phone number is already taken by another user
    if (phone !== user.phone) {
      const existingUser = await User.findOne({
        phone: phone.trim(),
        _id: { $ne: session.id },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Phone number is already registered" },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      session.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Log profile update for security
    console.log(`Profile updated for user: ${updatedUser.email} at ${new Date().toISOString()}`);

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: errorMessages.join(", ") },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, message: `${field} is already registered` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error while updating profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for partial profile updates (e.g., preferences, settings)
 * @returns {Promise<NextResponse>} JSON response with success/failure message
 */
export async function PATCH(request) {
  try {
    // Check if user is authenticated
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const updateData = await request.json();

    // Define allowed fields for partial updates
    const allowedFields = [
      'preferences',
      'notifications',
      'theme',
      'language',
      'timezone'
    ];

    // Filter update data to only include allowed fields
    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    filteredData.updatedAt = new Date();

    // Update user with filtered data
    const updatedUser = await User.findByIdAndUpdate(
      session.id,
      { $set: filteredData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile settings updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile settings:", error);

    return NextResponse.json(
      { success: false, message: "Server error while updating profile settings" },
      { status: 500 }
    );
  }
}