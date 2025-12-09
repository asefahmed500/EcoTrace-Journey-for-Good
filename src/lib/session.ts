import { getAuthSession } from './auth-wrapper';

export async function getServerSession() {
  try {
    return await getAuthSession();
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}