import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { User } from "@/lib/types";
import type { Session } from "next-auth";

interface AuthCheckResult {
  authorized: false;
  response: NextResponse;
  session?: never;
}

interface AuthSuccessResult {
  authorized: true;
  session: Session;
  response?: never;
}

export async function checkAuth(): Promise<
  AuthCheckResult | AuthSuccessResult
> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true,
    session,
  };
}

export async function checkAdminAuth(): Promise<
  AuthCheckResult | AuthSuccessResult
> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const user = session.user as User;
  if (user?.role !== "ADMIN") {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Forbidden: Admin access required" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    session,
  };
}
