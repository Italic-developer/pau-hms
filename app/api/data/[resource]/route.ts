import { ObjectId, type Document } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { getDb } from "@/lib/mongodb";
import { services, today, type ComplaintStatus, type OrderStatus } from "@/lib/store";
import type { User } from "@/lib/session";

export const runtime = "nodejs";

type Resource = "complaints" | "orders" | "tasks" | "cafe-orders";
type StoredResource = "complaints" | "serviceOrders" | "tasks" | "cafeOrders";

const collections: Record<Resource, StoredResource> = {
  complaints: "complaints",
  orders: "serviceOrders",
  tasks: "tasks",
  "cafe-orders": "cafeOrders",
};

function parseResource(value: string): Resource | null {
  return Object.hasOwn(collections, value) ? value as Resource : null;
}

function accessFilter(resource: Resource, user: User): Document | null {
  if (resource === "tasks" && (user.role === "warden" || user.role === "manager")) {
    return { hostel: user.hostelValue };
  }
  if (resource === "complaints" && user.role !== "student") {
    return { hostel: user.hostelValue };
  }
  if (resource === "orders" && user.role !== "student") {
    return { hostel: user.hostelValue };
  }
  if ((resource === "complaints" || resource === "orders" || resource === "cafe-orders") && user.role === "student") {
    return { userId: new ObjectId(user.id) };
  }
  return null;
}

function toClientDocument(document: Document) {
  const data = { ...document };
  delete data.userId;
  const { _id, ...rest } = data;
  return { ...rest, id: _id.toString() };
}

async function authorize(request: NextRequest, resource: Resource) {
  const user = await getAuthenticatedUser(request);
  if (!user) return { response: NextResponse.json({ error: "Please log in." }, { status: 401 }) };
  const filter = accessFilter(resource, user);
  if (!filter) return { response: NextResponse.json({ error: "You do not have access to this feature." }, { status: 403 }) };
  return { user, filter };
}

export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  try {
    const { resource: value } = await context.params;
    const resource = parseResource(value);
    if (!resource) return NextResponse.json({ error: "Unknown data resource." }, { status: 404 });
    const access = await authorize(request, resource);
    if ("response" in access) return access.response;
    const db = await getDb();
    const records = await db.collection(collections[resource])
      .find(access.filter)
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ items: records.map(toClientDocument) });
  } catch (error) {
    console.error("Data lookup failed", error);
    return NextResponse.json({ error: "Unable to load this data." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  try {
    const { resource: value } = await context.params;
    const resource = parseResource(value);
    if (!resource) return NextResponse.json({ error: "Unknown data resource." }, { status: 404 });
    const access = await authorize(request, resource);
    if ("response" in access) return access.response;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }
    const data = body as Record<string, unknown>;
    const now = new Date();
    const base = { hostel: access.user.hostelValue, createdAt: now, date: today() };
    let document: Document;

    if (resource === "complaints" && access.user.role === "student") {
      if (
        typeof data.category !== "string" ||
        !["Maintenance", "Cleaning", "Noise", "Other"].includes(data.category) ||
        typeof data.details !== "string" || data.details.trim().length < 3 || data.details.length > 2000
      ) {
        return NextResponse.json({ error: "Enter a valid complaint." }, { status: 400 });
      }
      document = {
        ...base,
        userId: new ObjectId(access.user.id),
        roomNo: access.user.roomNo,
        student: access.user.name,
        category: data.category,
        details: data.details.trim(),
        status: "Pending" satisfies ComplaintStatus,
      };
    } else if (resource === "orders" && access.user.role === "student") {
      const service = services.find((item) => item.id === data.serviceId);
      if (!service || typeof data.qty !== "number" || !Number.isInteger(data.qty) || data.qty < 1 || data.qty > 20) {
        return NextResponse.json({ error: "Choose a valid service and quantity." }, { status: 400 });
      }
      document = {
        ...base,
        userId: new ObjectId(access.user.id),
        roomNo: access.user.roomNo,
        student: access.user.name,
        service: service.name,
        kind: service.kind,
        qty: data.qty,
        total: service.price * data.qty,
        status: "Requested" satisfies OrderStatus,
      };
    } else if (resource === "cafe-orders" && access.user.role === "student" && access.user.hasCafe) {
      const menu = [
        { id: 1, name: "Jollof rice & chicken", price: 2500 },
        { id: 2, name: "Fried rice & plantain", price: 2300 },
        { id: 3, name: "Beef shawarma", price: 3000 },
        { id: 4, name: "Bottled water", price: 300 },
      ];
      if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > menu.length) {
        return NextResponse.json({ error: "Select at least one cafe item." }, { status: 400 });
      }
      const lines: string[] = [];
      let total = 0;
      for (const item of data.items) {
        if (!item || typeof item !== "object") {
          return NextResponse.json({ error: "Invalid cafe order." }, { status: 400 });
        }
        const selection = item as Record<string, unknown>;
        const menuItem = menu.find((candidate) => candidate.id === selection.id);
        if (!menuItem || typeof selection.quantity !== "number" || !Number.isInteger(selection.quantity) || selection.quantity < 1 || selection.quantity > 20) {
          return NextResponse.json({ error: "Invalid cafe order." }, { status: 400 });
        }
        lines.push(`${selection.quantity}× ${menuItem.name}`);
        total += selection.quantity * menuItem.price;
      }
      document = {
        ...base,
        userId: new ObjectId(access.user.id),
        items: lines.join(", "),
        total,
      };
    } else if (resource === "tasks" && (access.user.role === "warden" || access.user.role === "manager")) {
      if (typeof data.title !== "string" || !data.title.trim() || data.title.length > 200 || (data.to !== "warden" && data.to !== "manager")) {
        return NextResponse.json({ error: "Enter a task and choose a valid assignee." }, { status: 400 });
      }
      document = {
        ...base,
        title: data.title.trim(),
        from: access.user.role,
        to: data.to,
        done: false,
      };
    } else {
      return NextResponse.json({ error: "You do not have permission to create this item." }, { status: 403 });
    }

    const db = await getDb();
    const result = await db.collection(collections[resource]).insertOne(document);
    return NextResponse.json({ item: toClientDocument({ ...document, _id: result.insertedId }) }, { status: 201 });
  } catch (error) {
    console.error("Data creation failed", error);
    return NextResponse.json({ error: "Unable to save this item." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  try {
    const { resource: value } = await context.params;
    const resource = parseResource(value);
    if (!resource) return NextResponse.json({ error: "Unknown data resource." }, { status: 404 });
    const access = await authorize(request, resource);
    if ("response" in access) return access.response;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    }
    const data = body as Record<string, unknown>;
    if (typeof data.id !== "string" || !ObjectId.isValid(data.id)) {
      return NextResponse.json({ error: "Invalid item." }, { status: 400 });
    }

    let changes: Document | null = null;
    if (resource === "complaints" && access.user.role === "manager" &&
        ["Pending", "In progress", "Resolved"].includes(data.status as string)) {
      changes = { status: data.status };
    } else if (resource === "orders" && access.user.role === "warden" &&
        ["Requested", "In progress", "Done"].includes(data.status as string)) {
      changes = { status: data.status };
    } else if (resource === "tasks" && (access.user.role === "warden" || access.user.role === "manager") &&
        typeof data.done === "boolean") {
      changes = { done: data.done };
    }
    if (!changes) {
      return NextResponse.json({ error: "You do not have permission to make that update." }, { status: 403 });
    }

    const db = await getDb();
    const records = db.collection(collections[resource]);
    const updated = await records.findOneAndUpdate(
      { _id: new ObjectId(data.id), ...access.filter },
      { $set: changes },
      { returnDocument: "after" },
    );
    if (!updated) return NextResponse.json({ error: "Item not found." }, { status: 404 });
    return NextResponse.json({ item: toClientDocument(updated) });
  } catch (error) {
    console.error("Data update failed", error);
    return NextResponse.json({ error: "Unable to update this item." }, { status: 500 });
  }
}
