import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/simple-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`;

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export async function GET(request: NextRequest) {
  console.log('Google OAuth callback received:', request.url);
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=OAuthSignin`);
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=OAuthCallback`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();
    console.log('Successfully obtained tokens');

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const googleUser: GoogleUserInfo = await userResponse.json();
    console.log('Google user info:', { email: googleUser.email, name: googleUser.name });

    // Connect to database
    await dbConnect();

    // Check if user exists
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Create new user with all default values (same as email registration)
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        image: googleUser.picture,
        totalEmissions: 0,
        achievements: [],
        preferences: {
          favoriteRoutes: '',
          transportModes: '',
          environmentalPriorities: '',
        },
        // Community & Gamification features (same as email signup)
        totalPoints: 0,
        level: 1,
        activeChallenges: [],
        completedChallenges: [],
        streaks: {
          carFree: 0,
          cycling: 0,
          walking: 0,
          publicTransit: 0,
          zeroEmission: 0
        },
        friends: [],
        storiesShared: 0,
        // No password for OAuth users
      });
      console.log('Created new Google user:', user.email);
    } else {
      // Update user image if it's from Google and different
      if (googleUser.picture && user.image !== googleUser.picture) {
        user.image = googleUser.picture;
        await user.save();
        console.log('Updated user image for:', user.email);
      }
    }

    // Create session
    await createSession(user._id.toString());
    console.log('Session created for user:', user.email);

    // Get callback URL from cookie
    const cookieStore = await cookies();
    const callbackUrl = cookieStore.get('oauth_callback_url')?.value || '/dashboard';
    
    // Clear the callback URL cookie
    cookieStore.delete('oauth_callback_url');

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${callbackUrl}`;
    console.log('Redirecting to:', redirectUrl);
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=OAuthCallback`);
  }
}