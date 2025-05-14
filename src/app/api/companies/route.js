// src/app/api/companies/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Company from '@/models/Company';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

/**
 * GET handler to retrieve a list of verified companies
 * @returns {Promise<NextResponse>} JSON response with companies data
 */
export async function GET(request) {
  try {
    await connectDB();
    
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const isKisteKlarCertified = searchParams.get('certified') === 'true';
    const minRating = parseFloat(searchParams.get('rating') || '0');
    
    // Build query object for filtering
    const query = { isVerified: true };
    
    if (city) {
      query.$or = [
        { 'serviceAreas.from': { $regex: new RegExp(city, 'i') } },
        { 'serviceAreas.to': { $regex: new RegExp(city, 'i') } }
      ];
    }
    
    if (isKisteKlarCertified) {
      query.isKisteKlarCertified = true;
    }
    
    if (minRating) {
      query.averageRating = { $gte: minRating };
    }
    
    // Find companies based on the query
    const companies = await Company.find(query)
      .select('companyName hourlyRate isKisteKlarCertified averageRating reviewsCount serviceAreas logo')
      .sort({ averageRating: -1 }); // Sort by rating in descending order
    
    return NextResponse.json(
      { success: true, companies },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error retrieving companies:', error);
    
    return NextResponse.json(
      { success: false, message: 'Server error while retrieving companies' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new company
 * Only authenticated users with 'company' role can create a company
 * @returns {Promise<NextResponse>} JSON response with success/failure message
 */
export async function POST(request) {
  try {
    const session = getSession();
    
    if (!session || session.role !== 'company') {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Check if the user already has a company
    const existingCompany = await Company.findOne({ userId: session.id });
    
    if (existingCompany) {
      return NextResponse.json(
        { success: false, message: 'User already has a company profile' },
        { status: 400 }
      );
    }
    
    const { 
      companyName, 
      address, 
      taxId, 
      description, 
      serviceAreas, 
      hourlyRate,
      isKisteKlarCertified
    } = await request.json();
    
    // Validate required fields
    if (!companyName || !address || !taxId || !hourlyRate) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new company
    const newCompany = await Company.create({
      userId: session.id,
      companyName,
      address,
      taxId,
      description,
      serviceAreas: serviceAreas || [],
      hourlyRate: parseFloat(hourlyRate),
      isVerified: false, // Needs to be verified by admin
      isKisteKlarCertified: isKisteKlarCertified || false,
      documents: {
        businessLicense: {
          url: null,
          verified: false
        },
        kisteKlarCertificate: {
          url: null,
          verified: false
        }
      },
      averageRating: 0,
      reviewsCount: 0
    });
    
    // Get user email for admin notification
    const user = await User.findById(session.id);
    
    // Send email notification to admin for verification (implement in email.js)
    // await sendCompanyVerificationRequestEmail({
    //   companyName,
    //   companyEmail: user.email,
    //   companyPhone: user.phone
    // });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Company profile created and submitted for verification',
        company: newCompany
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating company:', error);
    
    return NextResponse.json(
      { success: false, message: 'Server error while creating company' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler to update an existing company
 * Only company owner or admin can update a company
 * @returns {Promise<NextResponse>} JSON response with success/failure message
 */
export async function PATCH(request) {
  try {
    const session = getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Find the company
    const company = await Company.findById(id);
    
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Verify authorization - must be the company owner or an admin
    if (session.role === 'company' && company.userId.toString() !== session.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this company' },
        { status: 403 }
      );
    } else if (session.role !== 'company' && session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update companies' },
        { status: 403 }
      );
    }
    
    // Filter out fields that cannot be updated by company owners
    const allowedUpdateFields = ['companyName', 'address', 'taxId', 'description', 'serviceAreas', 'hourlyRate'];
    
    // If the user is not an admin, filter the update data
    if (session.role !== 'admin') {
      Object.keys(updateData).forEach(key => {
        if (!allowedUpdateFields.includes(key)) {
          delete updateData[key];
        }
      });
    }
    
    // Additional validations
    if (updateData.hourlyRate) {
      updateData.hourlyRate = parseFloat(updateData.hourlyRate);
      
      if (isNaN(updateData.hourlyRate) || updateData.hourlyRate <= 0) {
        return NextResponse.json(
          { success: false, message: 'Hourly rate must be a positive number' },
          { status: 400 }
        );
      }
    }
    
    // Update the company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Company updated successfully',
        company: updatedCompany
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating company:', error);
    
    return NextResponse.json(
      { success: false, message: 'Server error while updating company' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a company
 * Only company owner or admin can delete a company
 * @returns {Promise<NextResponse>} JSON response with success/failure message
 */
export async function DELETE(request) {
  try {
    const session = getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Parse query parameters to get company ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Find the company
    const company = await Company.findById(id);
    
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Verify authorization - must be the company owner or an admin
    if (session.role === 'company' && company.userId.toString() !== session.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this company' },
        { status: 403 }
      );
    } else if (session.role !== 'company' && session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete companies' },
        { status: 403 }
      );
    }
    
    // Delete uploaded documents from storage if applicable
    if (company.documents?.businessLicense?.url) {
      // Implement file deletion logic (e.g., from S3)
      // await deleteFile(company.documents.businessLicense.url);
    }
    
    if (company.documents?.kisteKlarCertificate?.url) {
      // await deleteFile(company.documents.kisteKlarCertificate.url);
    }
    
    // Delete the company
    await Company.findByIdAndDelete(id);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Company deleted successfully'
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting company:', error);
    
    return NextResponse.json(
      { success: false, message: 'Server error while deleting company' },
      { status: 500 }
    );
  }
}