import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { createSession, attachSessionCookie } from "@/lib/auth-server";
import { getDb, getMongoClient } from "@/lib/mongodb";
import { getHostel } from "@/lib/hostels";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid account details." }, { status: 400 });
    }

    const { name, password, gender, hostelValue, roomSize } = body as Record<string, unknown>;
    if (
      typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100 ||
      typeof password !== "string" || password.length < 6 || password.length > 128 ||
      (gender !== "male" && gender !== "female") ||
      typeof hostelValue !== "string" ||
      typeof roomSize !== "number" || !Number.isInteger(roomSize) || ![1, 2, 3].includes(roomSize)
    ) {
      return NextResponse.json({ error: "Check your name, password, gender and room selection." }, { status: 400 });
    }

    const hostel = getHostel(hostelValue);
    const room = hostel?.rooms.find((option) => option.size === roomSize);
    if (!hostel || hostel.gender !== gender || !room) {
      return NextResponse.json({ error: "That hostel or room selection is invalid." }, { status: 400 });
    }

    const db = await getDb();
    const nameKey = name.trim().toLocaleLowerCase("en");
    const passwordHash = await bcrypt.hash(password, 12);
    const mongoClient = await getMongoClient();

    let sessionToken = "";
    const mongoTransaction = mongoClient.startSession();
    try {
      await mongoTransaction.withTransaction(async () => {
        const inventory = db.collection("roomInventory");
        await inventory.updateOne(
          { hostel: hostelValue, size: roomSize },
          { $setOnInsert: { booked: 0, capacity: room.available, totalCapacity: room.total } },
          { upsert: true, session: mongoTransaction },
        );
        const booking = await inventory.updateOne(
          { hostel: hostelValue, size: roomSize, $expr: { $lt: ["$booked", "$capacity"] } },
          { $inc: { booked: 1 } },
          { session: mongoTransaction },
        );
        if (booking.modifiedCount !== 1) throw new Error("ROOMS_FULL");

        const inventoryRecord = await inventory.findOne(
          { hostel: hostelValue, size: roomSize },
          { session: mongoTransaction },
        );
        const accountId = new ObjectId();
        const roomNo = `${hostel.label[0]}-${roomSize}-${inventoryRecord?.booked}`;
        await db.collection("users").insertOne({
          _id: accountId,
          name: name.trim(),
          nameKey,
          passwordHash,
          gender,
          hostelValue,
          roomNo,
          role: "student",
          createdAt: new Date(),
        }, { session: mongoTransaction });
        sessionToken = await createSession(accountId, mongoTransaction);
      });
    } finally {
      await mongoTransaction.endSession();
    }

    const response = NextResponse.json({ ok: true });
    attachSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "ROOMS_FULL") {
      return NextResponse.json({ error: "Sorry, that room was just taken. Please pick another." }, { status: 409 });
    }
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "An account with that name already exists. Try logging in." }, { status: 409 });
    }
    console.error("Student signup failed", error);
    return NextResponse.json({ error: "Unable to create your account. Please try again." }, { status: 500 });
  }
}
