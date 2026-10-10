import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, deleteSession } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await deleteSession(request);
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("Logout failed", error);
    return NextResponse.json({ error: "Unable to log out right now." }, { status: 500 });
  }
}
