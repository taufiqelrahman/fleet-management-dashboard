import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { compare } from "bcryptjs";
import type { User } from "./types";

const mockUsers = [
  {
    id: "admin-1",
    email: "admin@nextfleet.com",
    password: "$2a$10$K7L6JmZXZ6Y0jY0qZ0qZ0e.Q0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0",
    name: "Admin User",
    role: "ADMIN" as const,
  },
  {
    id: "operator-1",
    email: "operator@nextfleet.com",
    password: "$2a$10$K7L6JmZXZ6Y0jY0qZ0qZ0e.Q0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0",
    name: "Operator User",
    role: "OPERATOR" as const,
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = mockUsers.find((u) => u.email === credentials.email);

        if (!user) {
          return null;
        }

        if (credentials.password === "password123") {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
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
