import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcryptjs from "bcryptjs";
import { getSession } from "@/lib/auth";

/**
 * POST handler to reset user password
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    // Check if user is authenticated and is admin
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find user by ID
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate a temporary password (8 characters) - simple random generation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let tempPassword = '';
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Hash the temporary password using bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(tempPassword, saltRounds);

    // Update user's password
    await User.findByIdAndUpdate(id, {
      password: hashedPassword,
      // Optional: Add fields to track password reset
      passwordResetAt: new Date(),
      requirePasswordChange: true
    });

    // Log the temporary password for development (remove in production)
    console.log(`🔑 Temporary password for ${user.email}: ${tempPassword}`);

    // TODO: In production, send email instead of logging
    // await sendPasswordResetEmail(user.email, tempPassword);

    return NextResponse.json({
      success: true,
      message: `Password reset successfully. New temporary password: ${tempPassword}`,
      // For development only - remove tempPassword from response in production
      tempPassword: tempPassword,
      userEmail: user.email
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset password" },
      { status: 500 }
    );
  }
}