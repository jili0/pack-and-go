// src/app/api/auth/delete/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Company from '@/models/Company';
import Order from '@/models/Order';
import Review from '@/models/Review';
import { getSession, removeTokenCookie } from '@/lib/auth';
import { deleteFile } from '@/lib/fileUpload';

export async function DELETE(request) {
  try {
    // Check if user is authenticated
    const session = getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Get user info from database
    const user = await User.findById(session.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // If user is a company, delete company profile and uploaded documents
    if (session.role === 'company') {
      const company = await Company.findOne({ userId: session.id });
      
      if (company) {
        // Delete uploaded documents from storage
        if (company.documents) {
          if (company.documents.businessLicense && company.documents.businessLicense.url) {
            await deleteFile(company.documents.businessLicense.url);
          }
          
          if (company.documents.kisteKlarCertificate && company.documents.kisteKlarCertificate.url) {
            await deleteFile(company.documents.kisteKlarCertificate.url);
          }
        }
        
        // Delete company record
        await Company.findByIdAndDelete(company._id);
      }
    }
    
    // Update orders - mark as cancelled if pending/confirmed, but keep historical data
    if (session.role === 'user') {
      // For users, update orders where they are the customer
      await Order.updateMany(
        { 
          userId: session.id,
          status: { $in: ['pending', 'confirmed'] }
        },
        { 
          status: 'cancelled',
          notes: user.notes ? `${user.notes}\n\nUser account deleted.` : 'User account deleted.'
        }
      );
    } else if (session.role === 'company') {
      // For companies, update orders where they are the service provider
      const company = await Company.findOne({ userId: session.id });
      
      if (company) {
        await Order.updateMany(
          { 
            companyId: company._id,
            status: { $in: ['pending', 'confirmed'] }
          },
          { 
            status: 'cancelled',
            notes: company.notes ? `${company.notes}\n\nCompany account deleted.` : 'Company account deleted.'
          }
        );
      }
    }
    
    // Anonymize reviews but keep the review content
    await Review.updateMany(
      { userId: session.id },
      { 
        $set: { 
          userDeleted: true,
          userName: 'Deleted User'
        }
      }
    );
    
    // Delete the user
    await User.findByIdAndDelete(session.id);
    
    // Clear the authentication cookie
    const response = NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    );
    
    // Remove auth cookie
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      path: '/',
      expires: new Date(0),
      sameSite: 'strict'
    });
    
    return response;
  } catch (error) {
    console.error('Error deleting account:', error);
    
    return NextResponse.json(
      { success: false, message: 'Server error while deleting account' },
      { status: 500 }
    );
  }
}