// app/api/me/route.ts
import { getSession } from "@/lib/auth";
import { getHostel } from "@/lib/hostels";

export async function GET() {
  const s = await getSession();
  if (!s) return Response.json({ error: "Not signed in" }, { status: 401 });
  const h = getHostel(s.hostelValue);
  return Response.json({
    user: { ...s, hostel: h?.label ?? "", hasCafe: h?.hasCafe ?? false },
  });
}
