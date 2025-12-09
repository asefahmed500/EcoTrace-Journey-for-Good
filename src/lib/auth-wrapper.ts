import { getCurrentUser } from '@/lib/simple-auth';

export async function getAuthSession() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }
    };
  } catch (error) {
    console.error('Auth session error:', error);
    return null;
  }
}