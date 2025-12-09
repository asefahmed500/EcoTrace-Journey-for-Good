// Authentication system test utilities
import { getCurrentUser } from '@/lib/simple-auth';
import dbConnect from './db';
import User from '@/models/User';

export async function testAuthSystem() {
  console.log('🔍 Testing Authentication System...');
  
  try {
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    await dbConnect();
    console.log('✅ Database connected successfully');

    // Test 2: User Model
    console.log('2. Testing User model...');
    const userCount = await User.countDocuments();
    console.log(`✅ User model working. Found ${userCount} users in database`);

    // Test 3: Session Handling
    console.log('3. Testing session handling...');
    const user = await getCurrentUser();
    if (user) {
      console.log(`✅ Session active for user: ${user.email}`);
    } else {
      console.log('ℹ️ No active session (this is normal if not logged in)');
    }

    // Test 4: Environment Variables
    console.log('4. Testing environment variables...');
    const requiredEnvVars = [
      'MONGODB_URI',
      'AUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length === 0) {
      console.log('✅ All required environment variables are set');
    } else {
      console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    }

    console.log('🎉 Authentication system test completed');
    return true;
  } catch (error) {
    console.error('❌ Authentication system test failed:', error);
    return false;
  }
}

export async function validateUserSession(userId: string) {
  try {
    await dbConnect();
    const user = await User.findById(userId).lean();
    
    if (!user) {
      throw new Error('User not found in database');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      totalEmissions: user.totalEmissions,
      achievements: user.achievements,
      preferences: user.preferences,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    throw error;
  }
}