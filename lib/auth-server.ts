import { createHash, randomBytes } from "node:crypto";
import { ObjectId, type ClientSession } from "mongodb";
import type { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getHostel } from "@/lib/hostels";
import type { Role, User } from "@/lib/session";

const SESSION_COOKIE = "hms_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

interface UserDocument {
  _id: ObjectId;
  name: string;
  nameKey: string;
  passwordHash: string;
  gender: "male" | "female";
  hostelValue: string;
  roomNo: string;
  role: Role;
  createdAt: Date;
}

interface SessionDocument {
  tokenHash: string;
  userId: ObjectId;
  expiresAt: Date;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function createSession(userId: ObjectId, session?: ClientSession) {
  const token = randomBytes(32).toString("hex");
  const db = await getDb();
  await db.collection<SessionDocument>("sessions").insertOne(
    { tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + SESSION_DURATION_MS) },
    { session },
  );
  return token;
}

export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDb();
  const session = await db.collection<SessionDocument>("sessions").findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;

  const account = await db.collection<UserDocument>("users").findOne({ _id: session.userId });
  const hostel = account && getHostel(account.hostelValue);
  if (
    !account ||
    !hostel ||
    (account.role !== "student" && account.role !== "warden" && account.role !== "manager")
  ) return null;

  return {
    id: account._id.toString(),
    name: account.name,
    hostel: hostel.label,
    hostelValue: account.hostelValue,
    hasCafe: hostel.hasCafe,
    roomNo: account.roomNo,
    role: account.role,
  };
}

export async function deleteSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return;
  const db = await getDb();
  await db.collection<SessionDocument>("sessions").deleteOne({ tokenHash: hashToken(token) });
}
