import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { createSession } from "@/lib/auth";
import { getHostel } from "@/lib/hostels";

export async function POST(req: Request) {
  const { name, password, gender, hostelValue, roomSize } = await req.json();

  const hostel = getHostel(hostelValue);
  const room = hostel?.rooms.find((r) => r.size === roomSize);
  const cleanName = String(name ?? "").trim();

  if (!cleanName || String(password ?? "").length < 6 || !hostel || !room) {
    return Response.json({ error: "Invalid details." }, { status: 400 });
  }
  if (hostel.gender !== gender) {
    return Response.json({ error: "That hostel isn't available for your gender." }, { status: 400 });
  }

  const db = await getDb();
  const accounts = db.collection("accounts");

  const taken = await accounts.countDocuments({ hostelValue, roomSize });
  if (taken >= room.available) {
    return Response.json({ error: "Sorry, that room was just taken. Please pick another." }, { status: 409 });
  }

  // TODO: verify the Paystack/Flutterwave payment here before creating the account

  const inHostel = await accounts.countDocuments({ hostelValue, role: "student" });
  const roomNo = `${hostel.label[0]}-${inHostel + 1}`;

  try {
    const { insertedId } = await accounts.insertOne({
      name: cleanName,
      nameLower: cleanName.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: "student",
      gender,
      hostelValue,
      roomSize,
      roomNo,
      createdAt: new Date(),
    });
    await createSession({ id: insertedId.toString(), name: cleanName, role: "student", hostelValue, roomNo });
    return Response.json({ ok: true });
  } catch (e: any) {
    if (e?.code === 11000) {
      return Response.json({ error: "An account with that name already exists." }, { status: 409 });
    }
    throw e;
  }
}
