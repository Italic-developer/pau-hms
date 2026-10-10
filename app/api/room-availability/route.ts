import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hostels } from "@/lib/hostels";
import { takenKey } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const booked = await db.collection("roomInventory").find().toArray();
    const taken: Record<string, number> = {};
    for (const record of booked) {
      if (typeof record.hostel === "string" && typeof record.size === "number" && typeof record.booked === "number") {
        taken[takenKey(record.hostel, record.size)] = record.booked;
      }
    }
    for (const hostel of hostels) {
      for (const room of hostel.rooms) {
        taken[takenKey(hostel.value, room.size)] ??= 0;
      }
    }
    return NextResponse.json({ taken });
  } catch (error) {
    console.error("Room availability lookup failed", error);
    return NextResponse.json({ error: "Unable to load room availability." }, { status: 500 });
  }
}
