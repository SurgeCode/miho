import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { mihoInvited } from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
    const { inviteCode, address } = await req.json();
    if (!inviteCode) {
      return NextResponse.json(
        { success: false, message: "Invite code is required" },
        { status: 400 }
      );
    }
    const invited = await db
      .select()
      .from(mihoInvited)
      .where(eq(mihoInvited.address, address))
      .limit(1);
    if (invited.length > 0) {
      return NextResponse.json({ success: true });
    }
    if (inviteCode === "miho-beta") {
      await db.insert(mihoInvited).values({ address });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { success: false, message: "Invalid invite code" },
      { status: 403 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!req.nextUrl.searchParams.get("address")) {
      return NextResponse.json(
        { success: false, message: "Address is required" },
        { status: 400 }
      );
    }
    const invited = await db
      .select()
      .from(mihoInvited)
      .where(eq(mihoInvited.address, req.nextUrl.searchParams.get("address") || ""))
      .limit(1);
    const isVerified = invited.length > 0;
    return NextResponse.json({ verified: isVerified });
  } catch (error) {
    console.error("Error checking verification status:", error);
    return NextResponse.json(
      { verified: false, message: "Error checking verification" },
      { status: 500 }
    );
  }
} 