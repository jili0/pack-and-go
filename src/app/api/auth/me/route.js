// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    // Get the session from the request
    const session = getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectDB();
    
    // Find the user by ID
    const user = await User.findById(session.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return the user data
    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt
        } 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    
    return NextResponse.json(
      { success: false, message: 'Server error fetching user' },
      { status: 500 }
    );
  }
}

// This route can also be used to check the current authentication status
export async function HEAD() {
  const session = getSession();
  
  if (!session) {
    return new Response(null, { status: 401 });
  }
  
  return new Response(null, { status: 200 });
}