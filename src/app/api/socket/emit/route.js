/// /src/app/api/socket/emit/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { event, room, data } = await request.json();
    console.log('💡 /api/socket/emit received request:');
    console.log('   Event:', event);
    console.log('   Room:', room);
    console.log('   Data:', data);

    if (!event || !data) {
      return NextResponse.json(
        { success: false, message: "Event and Data are required" },
        { status: 400 }
      );
    }

    const io = globalThis.io;

    if (!io) {
      console.error("Socket.IO instance not found in /api/socket/emit.");
      return NextResponse.json(
        { success: false, message: "Socket.IO not available" },
        { status: 500 }
      );
    }

    switch (event) {
      case 'order-created': {
        const { orderId, companyId } = data;
        const companyRoom = `company-${companyId}`;
        console.log(`📦 Emitting 'notification' (order-created) to room ${companyRoom}`);
        io.to(companyRoom).emit('notification', {
          type: 'order-created',
          message: `New booking request received! (ID: ${orderId})`,
          orderId,
          target: "company",
          timestamp: new Date().toISOString(),
        });

        io.to("admin").emit("notification", {
          type: "order-created",
          message: `New order created (ID: ${orderId})`,
          orderId,
          target: "admin",
          timestamp: new Date().toISOString(),
        });
        break;
      }

      case 'order-confirmed': {
        const { orderId: confirmedOrderId, accountId } = data;
        const userRoom = `user-${accountId}`;
        console.log(`✅ Emitting 'notification' (order-confirmed) to room ${userRoom}`);
        io.to(userRoom).emit('notification', {
          type: 'order-confirmed',
          message: `Your booking has been confirmed! (ID: ${confirmedOrderId})`,
          orderId: confirmedOrderId,
          target: "user",
          timestamp: new Date().toISOString(),
        });

        io.to("admin").emit("notification", {
          type: "order-confirmed",
          message: `Booking confirmed: ${confirmedOrderId} for user: ${accountId}`,
          orderId: confirmedOrderId,
          target: "admin",
          timestamp: new Date().toISOString(),
        });
        break;
      }

      case 'order-cancelled': {
        const { orderId: cancelledOrderId, accountId: cancelledAccountId } = data;
        const userRoom = `user-${cancelledAccountId}`;
        console.log(`❌ Emitting 'notification' (order-cancelled) to room ${userRoom}`);
        io.to(userRoom).emit('notification', {
          type: 'order-cancelled',
          message: `Your booking was declined. (ID: ${cancelledOrderId})`,
          orderId: cancelledOrderId,
          target: "user",
          timestamp: new Date().toISOString(),
        });

        io.to("admin").emit("notification", {
          type: "order-cancelled",
          message: `Booking cancelled: ${cancelledOrderId} for user: ${cancelledAccountId}`,
          orderId: cancelledOrderId,
          target: "admin",
          timestamp: new Date().toISOString(),
        });
        break;
      }

      case 'review-saved-notification': {
        const { reviewId, companyId: reviewCompanyId, rating, userId, userName, companyName } = data;
        console.log(`⭐ Emitting 'notification' (new_review) for company ${reviewCompanyId} - ${rating}★`);

        io.to('admin').emit('notification', {
          type: 'new_review_admin',
          message: `New review (${rating} stars) for '${companyName}' from '${userName}'.`,
          link: `/admin/reviews?id=${reviewId}`,
          target: 'admin',
          reviewId,
          timestamp: new Date().toISOString(),
          read: false,
        });

        const companyRoom = `company-${reviewCompanyId}`;
        io.to(companyRoom).emit('notification', {
          type: 'new_review_company',
          message: `You have received a new review (${rating} stars) from '${userName}'.`,
          link: `/company/reviews?id=${reviewId}`,
          target: 'company',
          reviewId,
          timestamp: new Date().toISOString(),
          read: false,
        });
        break;
      }

      default:
        return NextResponse.json(
          { success: false, message: "Unknown event" },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { success: true, message: `Event ${event} successfully sent` },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error sending socket event:", error);
    return NextResponse.json(
      { success: false, message: "Server error sending socket event" },
      { status: 500 }
    );
  }
}
