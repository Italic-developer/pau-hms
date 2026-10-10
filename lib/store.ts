"use client";

import { useCallback, useEffect, useState } from "react";

export function useShared<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) setValue(JSON.parse(raw));
      } catch {}
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
        return resolved;
      });
    },
    [key]
  );

  return [value, update] as const;
}

export const today = () =>
  new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric" });

export const services = [
  { id: "wash", name: "Washing", unit: "per bag", price: 1500, kind: "laundry" },
  { id: "iron", name: "Ironing", unit: "per 10 items", price: 800, kind: "laundry" },
  { id: "clean", name: "Room cleaning", unit: "per visit", price: 2000, kind: "cleaning" },
  { id: "deep", name: "Deep cleaning", unit: "per visit", price: 5000, kind: "cleaning" },
] as const;

export type OrderStatus = "Requested" | "In progress" | "Done";
export type ComplaintStatus = "Pending" | "In progress" | "Resolved";

export interface ServiceOrder {
  id: number; hostel: string; roomNo: string; student: string;
  service: string; kind: "laundry" | "cleaning";
  qty: number; total: number; status: OrderStatus; date: string;
}

export interface Complaint {
  id: number; hostel: string; roomNo: string; student: string;
  category: string; details: string; status: ComplaintStatus; date: string;
}

export interface Task {
  id: number; hostel: string; title: string;
  from: "warden" | "manager"; to: "warden" | "manager";
  done: boolean; date: string;
}

export const seedComplaints: Complaint[] = [
  { id: 1, hostel: "amethyst", roomNo: "A-12", student: "Tobi Adeyemi", category: "Maintenance", details: "Bathroom tap is leaking", status: "In progress", date: "Oct 7" },
  { id: 2, hostel: "amethyst", roomNo: "A-31", student: "Emeka Obi", category: "Noise", details: "Loud music after 11pm", status: "Pending", date: "Oct 9" },
];

export const seedOrders: ServiceOrder[] = [
  { id: 1, hostel: "amethyst", roomNo: "A-12", student: "Tobi Adeyemi", service: "Washing", kind: "laundry", qty: 2, total: 3000, status: "Requested", date: "Oct 9" },
  { id: 2, hostel: "amethyst", roomNo: "A-31", student: "Emeka Obi", service: "Room cleaning", kind: "cleaning", qty: 1, total: 2000, status: "In progress", date: "Oct 9" },
];

export const seedTasks: Task[] = [
  { id: 1, hostel: "amethyst", title: "Check water pressure on 2nd floor", from: "manager", to: "warden", done: false, date: "Oct 8" },
];
