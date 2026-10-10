import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, password } = await req.json();
  const db = await getDb();

  const acc = await db.collection("accounts").findOne({
    nameLower: String(name ?? "").trim().toLowerCase(),
  });

  const ok = acc && (await bcrypt.compare(String(password ?? ""), acc.passwordHash));
  if (!acc || !ok) {
    return Response.json({ error: "Wrong name or password." }, { status: 401 });
  }

  await createSession({
    id: acc._id.toString(),
    name: acc.name,
    role: acc.role,
    hostelValue: acc.hostelValue,
    roomNo: acc.roomNo,
  });
  return Response.json({ ok: true });
}
