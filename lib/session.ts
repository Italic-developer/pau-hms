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
export function getRole(name: string, hostelValue: string): Role {
  const n = name.trim().toLowerCase();
  if (n === `warden.${hostelValue}`) return "warden";
  if (n === `manager.${hostelValue}`) return "manager";
  return "student";
}
