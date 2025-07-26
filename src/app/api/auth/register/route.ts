'use server';

import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { signIn } from '@/auth';

const registerSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = registerSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input.',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { name, email, password } = validatedFields.data;

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'A user with this email already exists.',
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });
    
    // Sign in the user after registration
    await signIn('credentials', {
        email,
        password,
        redirect: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
    }, { status: 201 });

  } catch (e) {
    console.error('Error in registerUser:', e);
    // This could be a database error or a signIn error
    if ((e as Error).message.includes('CredentialsSignin')) {
         return NextResponse.json({
            success: false,
            message: 'An unexpected error occurred during login after registration.',
        }, { status: 500 });
    }
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred during registration.',
    }, { status: 500 });
  }
}
