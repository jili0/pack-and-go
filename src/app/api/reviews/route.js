// app/api/reviews/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db'; // Fixed import path to match your existing code
import Review from '@/models/Review';
import Order from '@/models/Order';
import Company from '@/models/Company';
import { getSession } from '@/lib/auth'; // Using your existing auth function

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const reviews = await Review.find({})
      .populate("accountId", "name email")
      .populate("companyId", "companyName")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews }, { status: 200 });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Check authentication using your existing session function
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { orderId, companyId, rating, comment } = await request.json();

    // Validation
    if (!orderId || !companyId || !rating || !comment) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (comment.length > 500) {
      return NextResponse.json({ message: 'Comment cannot exceed 500 characters' }, { status: 400 });
    }

    // Verify order exists and belongs to the user
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.accountId.toString() !== session.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    if (order.status !== 'completed') {
      return NextResponse.json({ message: 'Can only review completed orders' }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return NextResponse.json({ message: 'Review already exists for this order' }, { status: 400 });
    }

    // Create new review
    const review = new Review({
      accountId: session.id,
      companyId,
      orderId,
      rating: parseInt(rating),
      comment: comment.trim(),
    });

    await review.save();
    // Recalculate averageRating and reviewsCount
    const reviews = await Review.find({ companyId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Company.findByIdAndUpdate(companyId, {
     averageRating: avgRating,
      reviewsCount: reviews.length,
    });


    // Update order to mark as reviewed
    await Order.findByIdAndUpdate(orderId, { review: review._id });

    return NextResponse.json({ 
      message: 'Review submitted successfully', 
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}