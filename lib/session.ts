import { getHostel } from "@/lib/hostels";
export type Role = "student" | "warden" | "manager";

export interface User {
  name: string;
  hostel: string;      // label
  hostelValue: string; // slug
  hasCafe: boolean;
  roomNo: string;
  role: Role;
}

const KEY = "hms-user";

export function saveUser(user: User) {
  sessionStorage.setItem(KEY, JSON.stringify(user));
}

export function getUser(): User | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const clearUser = () => sessionStorage.removeItem(KEY);

// PLACEHOLDER: roles must come from your backend. Anyone can type these names.
// Demo logins: warden.amethyst, manager.amethyst, warden.faith ...

// PLACEHOLDER: roles must come from your backend.
// Demo staff logins: warden.amethyst, manager.faith, ... (any password)
const STAFF = /^(warden|manager)[\s._-]+([a-z]+)$/i;

// PLACEHOLDER: roles must come from your backend.
// Accepts "warden.amethyst", "Warden Amethyst", "manager - faith", etc.
export function parseStaff(name: string) {
  const m = name.trim().match(STAFF);
  if (!m) return null;
  const role = m[1].toLowerCase() as "warden" | "manager";
  const hostelValue = m[2].toLowerCase();
  return { role, hostelValue, valid: !!getHostel(hostelValue) };
}
