export const today = () =>
  new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric" });

export const cafeMenu = [
  { id: 1, name: "Jollof rice & chicken", price: 2500 },
  { id: 2, name: "Fried rice & plantain", price: 2300 },
  { id: 3, name: "Beef shawarma", price: 3000 },
  { id: 4, name: "Bottled water", price: 300 },
];

export const services = [
  { id: "wash", name: "Washing", unit: "per bag", price: 1500, kind: "laundry" },
  { id: "iron", name: "Ironing", unit: "per 10 items", price: 800, kind: "laundry" },
  { id: "clean", name: "Room cleaning", unit: "per visit", price: 2000, kind: "cleaning" },
  { id: "deep", name: "Deep cleaning", unit: "per visit", price: 5000, kind: "cleaning" },
] as const;

export type OrderStatus = "Requested" | "In progress" | "Done";
export type ComplaintStatus = "Pending" | "In progress" | "Resolved";

export interface ServiceOrder {
  id: string; hostel: string; roomNo: string; student: string;
  service: string; kind: "laundry" | "cleaning";
  qty: number; total: number; status: OrderStatus; date: string;
}

export interface Complaint {
  id: string; hostel: string; roomNo: string; student: string;
  category: string; details: string; status: ComplaintStatus; date: string;
}

export interface Task {
  id: string; hostel: string; title: string;
  from: "warden" | "manager"; to: "warden" | "manager";
  done: boolean; date: string;
}

export const takenKey = (hostel: string, size: number) => `${hostel}:${size}`;

export const roomsLeft = (taken: Record<string, number>, hostel: string, size: number, base: number) =>
  Math.max(0, base - (taken[takenKey(hostel, size)] ?? 0));
