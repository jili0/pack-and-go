// src/app/api/auth/me/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    // Get the session from the request
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectDB();

    // Find the account by ID
    const account = await Account.findById(session.id).select("-password");

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    // Return the account data
    return NextResponse.json(
      {
        success: true,
        account: {
          id: account._id,
          name: account.name,
          email: account.email,
          phone: account.phone,
          role: account.role,
          createdAt: account.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching authenticated account:", error);

    return NextResponse.json(
      { success: false, message: "Server error fetching account" },
      { status: 500 }
    );
  }
}

// This route can also be used to check the current authentication status
export async function HEAD() {
  const session = await getSession();

  if (!session) {
    return new Response(null, { status: 401 });
  }

  return new Response(null, { status: 200 });
}
