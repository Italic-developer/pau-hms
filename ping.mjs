import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const hostels = ["amethyst", "jasper", "faith", "pearl"];
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const accounts = client.db(process.env.MONGODB_DB ?? "hms").collection("accounts");

await accounts.createIndex({ nameLower: 1 }, { unique: true });

const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD, 10);
for (const h of hostels) {
  for (const role of ["warden", "manager"]) {
    const name = `${role}.${h}`;
    await accounts.updateOne(
      { nameLower: name },
      { $setOnInsert: { name, nameLower: name, passwordHash, role, hostelValue: h, roomNo: "Staff", createdAt: new Date() } },
      { upsert: true }
    );
  }
}
console.log("Seeded.");
await client.close();
