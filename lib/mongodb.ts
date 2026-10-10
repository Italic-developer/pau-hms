import { MongoClient, type Db } from "mongodb";

const databaseName = process.env.MONGODB_DB || "pau_hms";

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
  var mongoDbPromise: Promise<Db> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Copy .env.example to .env.local and configure Atlas.");
  }
  if (!globalThis.mongoClientPromise) {
    globalThis.mongoClientPromise = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 30_000,
      serverSelectionTimeoutMS: 5_000,
    }).connect();
  }
  return globalThis.mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  if (!globalThis.mongoDbPromise) {
    globalThis.mongoDbPromise = getClientPromise().then(async (connectedClient) => {
      const db = connectedClient.db(databaseName);
      await Promise.all([
        db.collection("users").createIndex({ nameKey: 1 }, { unique: true }),
        db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
        db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        db.collection("roomInventory").createIndex({ hostel: 1, size: 1 }, { unique: true }),
      ]);
      return db;
    });
  }

  return await globalThis.mongoDbPromise;
}

export function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}
