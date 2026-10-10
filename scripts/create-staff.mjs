import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";

const { STAFF_NAME, STAFF_PASSWORD, STAFF_ROLE, STAFF_HOSTEL } = process.env;
const validHostels = new Set(["amethyst", "jasper", "faith", "pearl"]);

if (!STAFF_NAME || !STAFF_PASSWORD || !STAFF_ROLE || !STAFF_HOSTEL) {
  throw new Error("Set STAFF_NAME, STAFF_PASSWORD, STAFF_ROLE and STAFF_HOSTEL before running this script.");
}
if (!["warden", "manager"].includes(STAFF_ROLE)) {
  throw new Error("STAFF_ROLE must be either warden or manager.");
}
if (!validHostels.has(STAFF_HOSTEL)) {
  throw new Error(`Unknown hostel "${STAFF_HOSTEL}".`);
}
if (STAFF_NAME.trim().length < 2 || STAFF_PASSWORD.length < 6 || STAFF_PASSWORD.length > 128) {
  throw new Error("Staff names must be at least 2 characters; passwords must be 6-128 characters.");
}

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI to the Atlas connection string.");

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "pau_hms");
  await db.collection("users").createIndex({ nameKey: 1 }, { unique: true });
  const name = STAFF_NAME.trim();
  await db.collection("users").insertOne({
    _id: new ObjectId(),
    name,
    nameKey: name.toLocaleLowerCase("en"),
    passwordHash: await bcrypt.hash(STAFF_PASSWORD, 12),
    gender: null,
    hostelValue: STAFF_HOSTEL,
    roomNo: "Staff",
    role: STAFF_ROLE,
    createdAt: new Date(),
  });
  console.log(`Created ${STAFF_ROLE} account for ${name} at ${STAFF_HOSTEL}.`);
} finally {
  await client.close();
}
