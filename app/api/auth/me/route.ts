import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session lookup failed", error);
    return NextResponse.json({ error: "Unable to verify your session." }, { status: 500 });
  }
}
