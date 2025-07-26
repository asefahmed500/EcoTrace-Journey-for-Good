
import NextAuth from 'next-auth';
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import dbConnect from './lib/db';
import User from './models/User';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';
import type { MongoClient } from 'mongodb';

const clientPromise = dbConnect().then(conn => conn.connection.getClient() as MongoClient);

// The auth config is split out to be used in the middleware without
// the database adapter.
export const config = {
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
            return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email as string });

        if (!user || !user.password) {
          // No user found or user uses a social provider
          return null;
        }

        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (isMatch) {
          return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
        }
        
        // Return null for wrong password, NextAuth will handle the error
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
      signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
} satisfies Omit<NextAuthConfig, "adapter">;

// The main export includes the adapter.
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...config,
    adapter: MongoDBAdapter(clientPromise),
});
