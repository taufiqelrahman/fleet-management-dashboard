import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import type { User } from "./types";
import { prisma } from "./prisma";
import { trackLoginAttempt, checkSuspiciousActivity } from "./login-tracking";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          String(credentials.password),
          String(user.password)
        );

        if (!isPasswordValid) {
          return null;
        }

        // Track login attempt and detect new devices
        const userAgent = req?.headers?.["user-agent"] || "Unknown";
        const ipAddress =
          (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0] ||
          (req?.headers?.["x-real-ip"] as string) ||
          undefined;

        // Track login in background (don't block auth)
        trackLoginAttempt({
          userId: user.id,
          userAgent,
          ipAddress,
        }).catch((error) => {
          console.error("Failed to track login:", error);
        });

        // Check for suspicious activity
        checkSuspiciousActivity(user.id, ipAddress).catch((error) => {
          console.error("Failed to check suspicious activity:", error);
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as User).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as User).role = token.role as "ADMIN" | "OPERATOR";
        (session.user as User).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
