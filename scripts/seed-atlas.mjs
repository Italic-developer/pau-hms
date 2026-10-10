import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is missing. Put your Atlas connection string in .env, or export it before running.");
}

const client = new MongoClient(process.env.MONGODB_URI);
const databaseName = process.env.MONGODB_DB || "pau_hms";

const roomInventory = [
  { hostel: "amethyst", size: 1, capacity: 10, initiallyAvailable: 3 },
  { hostel: "amethyst", size: 2, capacity: 20, initiallyAvailable: 8 },
  { hostel: "amethyst", size: 3, capacity: 15, initiallyAvailable: 0 },
  { hostel: "jasper", size: 1, capacity: 8, initiallyAvailable: 0 },
  { hostel: "jasper", size: 2, capacity: 20, initiallyAvailable: 6 },
  { hostel: "jasper", size: 3, capacity: 15, initiallyAvailable: 9 },
  { hostel: "faith", size: 1, capacity: 8, initiallyAvailable: 0 },
  { hostel: "faith", size: 2, capacity: 20, initiallyAvailable: 5 },
  { hostel: "faith", size: 3, capacity: 15, initiallyAvailable: 12 },
  { hostel: "pearl", size: 1, capacity: 10, initiallyAvailable: 2 },
  { hostel: "pearl", size: 2, capacity: 20, initiallyAvailable: 7 },
  { hostel: "pearl", size: 3, capacity: 15, initiallyAvailable: 4 },
];

const seedCollections = {
  hostels: [
    { key: "amethyst", label: "Amethyst", gender: "male", hue: 305, hasCafe: true, description: "Cafe on site, close to the main gate", rooms: [{ size: 1, label: "1-man room", price: 450000, total: 10, available: 3 }, { size: 2, label: "2-man room", price: 320000, total: 20, available: 8 }, { size: 3, label: "3-man room", price: 250000, total: 15, available: 0 }] },
    { key: "jasper", label: "Jasper", gender: "male", hue: 150, hasCafe: false, description: "Quiet block near the sports complex", rooms: [{ size: 1, label: "1-man room", price: 500000, total: 8, available: 0 }, { size: 2, label: "2-man room", price: 350000, total: 20, available: 6 }, { size: 3, label: "3-man room", price: 270000, total: 15, available: 9 }] },
    { key: "faith", label: "Faith", gender: "female", hue: 250, hasCafe: false, description: "Quiet block, near the library", rooms: [{ size: 1, label: "1-man room", price: 400000, total: 8, available: 0 }, { size: 2, label: "2-man room", price: 290000, total: 20, available: 5 }, { size: 3, label: "3-man room", price: 220000, total: 15, available: 12 }] },
    { key: "pearl", label: "Pearl", gender: "female", hue: 10, hasCafe: true, description: "Newest block with a cafe", rooms: [{ size: 1, label: "1-man room", price: 480000, total: 10, available: 2 }, { size: 2, label: "2-man room", price: 340000, total: 20, available: 7 }, { size: 3, label: "3-man room", price: 260000, total: 15, available: 4 }] },
  ],
  announcements: [
    { key: "water-maintenance", title: "Water supply maintenance", body: "Water will be off on Tuesday, 10am to 2pm.", date: "Oct 9" },
    { key: "room-inspection", title: "Room inspection", body: "Routine inspection holds on Friday. Keep rooms tidy.", date: "Oct 8" },
    { key: "curfew-reminder", title: "Curfew reminder", body: "Gates close at 10pm. Late entry requires a pass.", date: "Oct 5" },
  ],
  roommates: [
    { key: "tobi-adeyemi", name: "Tobi Adeyemi", course: "Computer Science" },
    { key: "emeka-obi", name: "Emeka Obi", course: "Economics" },
  ],
  contacts: [
    { key: "hostel-warden", role: "Hostel warden", phone: "+234 800 000 0001" },
    { key: "maintenance-desk", role: "Maintenance desk", phone: "+234 800 000 0002" },
    { key: "security", role: "Security", phone: "+234 800 000 0003" },
  ],
  cafeMenu: [
    { key: "jollof-rice-chicken", name: "Jollof rice & chicken", price: 2500 },
    { key: "fried-rice-plantain", name: "Fried rice & plantain", price: 2300 },
    { key: "beef-shawarma", name: "Beef shawarma", price: 3000 },
    { key: "bottled-water", name: "Bottled water", price: 300 },
  ],
  serviceMenu: [
    { key: "wash", name: "Washing", unit: "per bag", price: 1500, kind: "laundry" },
    { key: "iron", name: "Ironing", unit: "per 10 items", price: 800, kind: "laundry" },
    { key: "clean", name: "Room cleaning", unit: "per visit", price: 2000, kind: "cleaning" },
    { key: "deep", name: "Deep cleaning", unit: "per visit", price: 5000, kind: "cleaning" },
  ],
  complaints: [
    { key: "demo-complaint-tap", hostel: "amethyst", roomNo: "A-12", student: "Tobi Adeyemi", category: "Maintenance", details: "Bathroom tap is leaking", status: "In progress", date: "Oct 7" },
    { key: "demo-complaint-noise", hostel: "amethyst", roomNo: "A-31", student: "Emeka Obi", category: "Noise", details: "Loud music after 11pm", status: "Pending", date: "Oct 9" },
  ],
  serviceOrders: [
    { key: "demo-order-washing", hostel: "amethyst", roomNo: "A-12", student: "Tobi Adeyemi", service: "Washing", kind: "laundry", qty: 2, total: 3000, status: "Requested", date: "Oct 9" },
    { key: "demo-order-cleaning", hostel: "amethyst", roomNo: "A-31", student: "Emeka Obi", service: "Room cleaning", kind: "cleaning", qty: 1, total: 2000, status: "In progress", date: "Oct 9" },
  ],
  tasks: [
    { key: "demo-task-water-pressure", hostel: "amethyst", title: "Check water pressure on 2nd floor", from: "manager", to: "warden", done: false, date: "Oct 8" },
  ],
};

try {
  await client.connect();
  const db = client.db(databaseName);

  await Promise.all([
    db.collection("users").createIndex({ nameKey: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("roomInventory").createIndex({ hostel: 1, size: 1 }, { unique: true }),
  ]);

  for (const room of roomInventory) {
    await db.collection("roomInventory").updateOne(
      { hostel: room.hostel, size: room.size },
      {
        $setOnInsert: {
          hostel: room.hostel,
          size: room.size,
          totalCapacity: room.capacity,
          capacity: room.initiallyAvailable,
          booked: 0,
        },
      },
      { upsert: true },
    );
  }

  for (const [collectionName, records] of Object.entries(seedCollections)) {
    const collection = db.collection(collectionName);
    for (const record of records) {
      const { key, ...data } = record;
      await collection.updateOne(
        { seedKey: key },
        { $set: { ...data, seedKey: key } },
        { upsert: true },
      );
    }
    console.log(`${collectionName}: seeded ${records.length} records`);
  }

  console.log(`Atlas seed complete (database: ${databaseName}). Existing bookings and user data were preserved.`);
} finally {
  await client.close();
}
