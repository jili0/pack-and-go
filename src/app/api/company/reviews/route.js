import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "company") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const reviews = await Review.find({ companyId: session.id })
      .populate("accountId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Error loading company reviews:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
