
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI in .env.local");

// Reuse one connection across hot reloads in development
const g = globalThis as unknown as { _mongo?: Promise<MongoClient> };
const clientPromise = g._mongo ?? (g._mongo = new MongoClient(uri).connect());

export async function getDb() {
  return (await clientPromise).db(process.env.MONGODB_DB ?? "hms");
}
