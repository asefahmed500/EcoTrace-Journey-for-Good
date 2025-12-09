import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
import { checkAndAwardAchievements } from '@/app/actions';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for new achievements
    const newAchievements = await checkAndAwardAchievements(user);
    
    if (newAchievements.length > 0) {
      await user.save();
    }

    return NextResponse.json({
      success: true,
      newAchievements,
      totalAchievements: user.achievements?.length || 0,
      message: newAchievements.length > 0 
        ? `Congratulations! You've unlocked ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!`
        : 'No new achievements at this time. Keep up the great work!'
    });
  } catch (error) {
    console.error('Error updating gamification:', error);
    return NextResponse.json(
      { error: 'Failed to update achievements' },
      { status: 500 }
    );
  }
}