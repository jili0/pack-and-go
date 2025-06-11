import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Company from '@/models/Company';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth';

/**
 * GET handler to retrieve a specific user by ID
 * @returns {Promise<NextResponse>} JSON response with user data
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Check if user is authenticated and is admin
    const session = await getSession();
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find user by ID
    const user = await User.findById(id)
      .select('-password') // Exclude password field
      .populate('orders')
      .populate('reviews');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // If user is a company, get company details
    let companyDetails = null;
    if (user.role === 'company') {
      companyDetails = await Company.findOne({ userId: user._id });
    }

    return NextResponse.json({
      success: true,
      user,
      companyDetails
    }, { status: 200 });

  } catch (error) {
    console.error('Error retrieving user:', error);

    return NextResponse.json(
      { success: false, message: 'Server error while retrieving user' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler to update user role or perform admin actions
 * @returns {Promise<NextResponse>} JSON response with success/failure message
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    // Check if user is authenticated and is admin
    const session = await getSession();
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { action, role, ...updateData } = await request.json();

    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    let updatedUser;

    switch (action) {
      case 'changeRole':
        // Validate role
        const validRoles = ['user', 'company', 'admin'];
        if (!role || !validRoles.includes(role)) {
          return NextResponse.json(
            { success: false, message: 'Invalid role specified' },
            { status: 400 }
          );
        }

        // Prevent changing the current admin's role
        if (user._id.toString() === session.id && role !== 'admin') {
          return NextResponse.json(
            { success: false, message: 'Cannot change your own admin role' },
            { status: 400 }
          );
        }

        updatedUser = await User.findByIdAndUpdate(
          id,
          { role },
          { new: true }
        ).select('-password');

        break;

      case 'suspend':
        // Add suspended field or update status
        updatedUser = await User.findByIdAndUpdate(
          id,
          { suspended: true, suspendedAt: new Date() },
          { new: true }
        ).select('-password');

        break;

      case 'unsuspend':
        // Remove suspended status
        updatedUser = await User.findByIdAndUpdate(
          id,
          { $unset: { suspended: 1, suspendedAt: 1 } },
          { new: true }
        ).select('-password');

        break;

      case 'updateProfile':
        // Update user profile information
        const allowedFields = ['name', 'phone'];
        const filteredData = {};
        
        Object.keys(updateData).forEach(key => {
          if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
          }
        });

        updatedUser = await User.findByIdAndUpdate(
          id,
          filteredData,
          { new: true }
        ).select('-password');

        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action} completed successfully`,
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating user:', error);

    return NextResponse.json(
      { success: false, message: 'Server error while updating user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to delete a user account
 * @returns {Promise<NextResponse>} JSON response with success/failure message
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if user is authenticated and is admin
    const session = await getSession();
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the current admin
    if (user._id.toString() === session.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // If user is a company, clean up company data
    if (user.role === 'company') {
      const company = await Company.findOne({ userId: id });
      if (company) {
        // Update orders to mark company as deleted but keep historical data
        await Order.updateMany(
          { companyId: company._id },
          { $set: { companyDeleted: true } }
        );
        
        // Delete company record
        await Company.findByIdAndDelete(company._id);
      }
    }

    // Update orders to mark user as deleted but keep historical data
    await Order.updateMany(
      { userId: id },
      { $set: { userDeleted: true } }
    );

    // Delete the user
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting user:', error);

    return NextResponse.json(
      { success: false, message: 'Server error while deleting user' },
      { status: 500 }
    );
  }
}