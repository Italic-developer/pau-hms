import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { attachSessionCookie, createSession } from "@/lib/auth-server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Enter your account details." }, { status: 400 });
    }
    const { name, password } = body as Record<string, unknown>;
    if (typeof name !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Enter your account details." }, { status: 400 });
    }

    const db = await getDb();
    const account = await db.collection("users").findOne({
      nameKey: name.trim().toLocaleLowerCase("en"),
    });
    if (!account || typeof account.passwordHash !== "string" || !(await bcrypt.compare(password, account.passwordHash))) {
      return NextResponse.json({ error: "No account matches those details. Check your login or sign up first." }, { status: 401 });
    }

    const token = await createSession(account._id);
    const response = NextResponse.json({ ok: true });
    attachSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to log in right now. Please try again." }, { status: 500 });
  }
}
