import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/simple-auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    return NextResponse.json({
      success: true,
      authenticated: !!user,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
      } : null,
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get auth status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}