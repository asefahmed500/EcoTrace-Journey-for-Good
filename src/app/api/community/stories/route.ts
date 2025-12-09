import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// Mock impact stories data (in real app, this would be a separate model)
const mockStories = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Chen',
    userImage: 'https://placehold.co/40x40',
    title: 'My Car-Free Month Journey',
    content: 'Completed my first car-free month challenge! Discovered amazing bike routes and saved 45kg of CO2. The city looks so different when you slow down and really see it.',
    emissions_saved: 45.2,
    likes: 23,
    comments: 8,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ['cycling', 'car-free', 'urban-exploration']
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Rodriguez',
    userImage: 'https://placehold.co/40x40',
    title: 'Public Transit Adventures',
    content: 'Week 3 of my public transit challenge. Met interesting people, read 2 books, and my stress levels are way down. Who knew commuting could be relaxing?',
    emissions_saved: 28.7,
    likes: 15,
    comments: 5,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tags: ['public-transit', 'mindfulness', 'community']
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Emma Thompson',
    userImage: 'https://placehold.co/40x40',
    title: 'Walking Changed My Life',
    content: 'Started walking to work 6 months ago. Lost 15 pounds, saved $200/month on gas, and discovered a local coffee shop that makes the best lattes in town!',
    emissions_saved: 156.3,
    likes: 42,
    comments: 12,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    tags: ['walking', 'health', 'local-business', 'savings']
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Alex Kim',
    userImage: 'https://placehold.co/40x40',
    title: 'E-bike Revolution',
    content: 'Switched to an e-bike for my daily commute. It\'s faster than driving in traffic, I arrive energized instead of stressed, and I\'ve saved over $300 in parking fees!',
    emissions_saved: 89.4,
    likes: 31,
    comments: 9,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    tags: ['e-bike', 'commuting', 'savings', 'health']
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Maria Santos',
    userImage: 'https://placehold.co/40x40',
    title: 'Family Cycling Adventures',
    content: 'Got the whole family cycling together on weekends. Kids love it, we\'re all getting fitter, and we\'ve discovered so many hidden gems in our neighborhood!',
    emissions_saved: 67.8,
    likes: 28,
    comments: 14,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    tags: ['family', 'cycling', 'weekend', 'exploration', 'health']
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, you'd fetch from database with pagination
    const stories = mockStories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, tags, emissions_saved } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // In a real app, you'd save to a Stories model
    const newStory = {
      id: Date.now().toString(),
      userId: session.user.id,
      userName: user.name || '',
      userImage: user.image || '',
      title,
      content,
      emissions_saved: emissions_saved || 0,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      tags: tags || []
    };

    // Mock saving - in real app, save to database
    mockStories.unshift(newStory);

    return NextResponse.json({
      success: true,
      message: 'Story shared successfully!',
      story: newStory
    });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}