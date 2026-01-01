import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-check";

/**
 * Subscribe to push notifications
 * POST /api/push/subscribe
 *
 * Body: {
 *   endpoint: string;
 *   keys: {
 *     p256dh: string;
 *     auth: string;
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if (!authResult.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (authResult.session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "";

    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existingSubscription) {
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          userId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
        },
      });
    } else {
      await prisma.pushSubscription.create({
        data: {
          userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription saved successfully",
    });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}

/**
 * Unsubscribe from push notifications
 * DELETE /api/push/subscribe
 *
 * Body: {
 *   endpoint: string;
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if (!authResult.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.delete({
      where: { endpoint },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription removed successfully",
    });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 }
    );
  }
}
