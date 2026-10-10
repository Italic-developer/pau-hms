import { getDb } from "@/lib/mongodb";

// Returns { "amethyst:2": 3, ... }, the number of rooms already taken
export async function GET() {
  const db = await getDb();
  const rows = await db.collection("accounts").aggregate([
    { $match: { role: "student" } },
    { $group: { _id: { h: "$hostelValue", s: "$roomSize" }, n: { $sum: 1 } } },
  ]).toArray();
  return Response.json(Object.fromEntries(rows.map((r) => [`${r._id.h}:${r._id.s}`, r.n])));
}
