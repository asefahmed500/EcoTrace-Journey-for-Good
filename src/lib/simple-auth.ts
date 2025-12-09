import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import dbConnect from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const secretKey = process.env.AUTH_SECRET || 'fallback-secret-key';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function createSession(userId: string) {
  const session = await encrypt({ userId, expires: Date.now() + 24 * 60 * 60 * 1000 });
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function login(email: string, password: string) {
  try {
    await dbConnect();
    const user = await User.findOne({ email });
    
    if (!user || !user.password) {
      return { error: 'Invalid credentials' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    await createSession(user._id.toString());
    return { success: true, user: { id: user._id.toString(), name: user.name, email: user.email } };
  } catch (error) {
    return { error: 'Login failed' };
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    await dbConnect();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      totalEmissions: 0,
      achievements: [],
      preferences: {
        favoriteRoutes: '',
        transportModes: '',
        environmentalPriorities: '',
      },
    });

    await createSession(user._id.toString());
    return { success: true, user: { id: user._id.toString(), name: user.name, email: user.email } };
  } catch (error) {
    return { error: 'Registration failed' };
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    await dbConnect();
    const user = await User.findById(session.userId).lean();
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
    };
  } catch (error) {
    return null;
  }
}