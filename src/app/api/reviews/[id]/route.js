import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    console.log("DELETE route called with params:", params);
    
    const session = await getSession();
    console.log("Session:", session);
    
    if (!session) {
      return NextResponse.json({ success: false, message: "No session found" }, { status: 401 });
    }
    
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    await connectDB();

    const { id } = params;
    console.log("Review ID to delete:", id);
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Review ID is required" }, { status: 400 });
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
    }

    if (review.orderId) {
      await Order.findByIdAndUpdate(review.orderId, { $unset: { review: 1 } });
    }

    await Review.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: "Review deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error: " + error.message 
    }, { status: 500 });
  }
}