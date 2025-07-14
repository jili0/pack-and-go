import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";

/**
 * GET handler to retrieve all accounts for admin
 * @returns {Promise<NextResponse>} JSON response with accounts data
 */
export async function GET(request) {
  try {
    // Check if account is authenticated and is admin
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");

    // Build query object for filtering
    const query = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Find accounts based on the query
    const accounts = await Account.find(query)
      .select("-password") // Exclude password field
      .populate("orders") // Include order count
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await Account.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        success: true,
        accounts,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving accounts:", error);

    return NextResponse.json(
      { success: false, message: "Server error while retrieving accounts" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';