import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Order from '@/models/Order';
import Company from '@/models/Company';
import Account from '@/models/Account';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let query = {};

    if (session.role === "admin") {
      // Admin sieht alles
    } else if (session.role === "company") {
      const company = await Company.findOne({ accountId: session.id });
      if (!company || company._id.toString() !== companyId) {
        return NextResponse.json({ message: "Not authorized for this company" }, { status: 403 });
      }
      query.companyId = companyId;
    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const reviews = await Review.find(query)
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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { orderId, companyId, rating, comment } = await request.json();

    if (!orderId || !companyId || !rating || !comment) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (comment.length > 500) {
      return NextResponse.json({ message: 'Comment cannot exceed 500 characters' }, { status: 400 });
    }

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

    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return NextResponse.json({ message: 'Review already exists for this order' }, { status: 400 });
    }

    const review = new Review({
      accountId: session.id,
      companyId,
      orderId,
      rating: parseInt(rating),
      comment: comment.trim(),
    });

    await review.save();

    // 🔧 Hole User & Company für Benachrichtigung
    const user = await Account.findById(session.id);
    const company = await Company.findById(companyId);

    const userName = user?.name || "Unbekannter Benutzer";
    const companyName = company?.companyName || "Unbekanntes Unternehmen";

    try {
      const socketResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/socket/emit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'review-saved-notification',
          data: {
            reviewId: review._id.toString(),
            companyId: review.companyId.toString(),
            rating: review.rating,
            userId: review.accountId.toString(),
            userName,
            companyName
          }
        })
      });

      if (socketResponse.ok) {
        console.log('✅ Socket event review-saved-notification emitted successfully via API.');
      } else {
        const text = await socketResponse.text();
        console.warn(`⚠️ Failed to emit socket event review-saved-notification: ${socketResponse.status} - ${text}`);
      }
    } catch (socketError) {
      console.error('❌ Error emitting socket event via API:', socketError);
    }

    // 📊 Durchschnitt aktualisieren
    const reviews = await Review.find({ companyId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Company.findByIdAndUpdate(companyId, {
      averageRating: avgRating,
      reviewsCount: reviews.length,
    });

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

