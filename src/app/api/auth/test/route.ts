import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/simple-auth';
import { testAuthSystem } from '@/lib/auth-test';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    // Run comprehensive auth system test
    const testResult = await testAuthSystem();
    
    // Get current session
    const user = await getCurrentUser();
    
    // Test database connectivity
    await dbConnect();
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Authentication system is working properly',
      data: {
        systemTest: testResult,
        session: user ? {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } : null,
        database: {
          connected: true,
          userCount,
        },
        environment: {
          hasMongoUri: !!process.env.MONGODB_URI,
          hasAuthSecret: !!process.env.AUTH_SECRET,
          hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
          hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
          hasGoogleMapsKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        }
      }
    });
  } catch (error) {
    console.error('Auth test API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Authentication system test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}