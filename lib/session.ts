export interface User {
  name: string;
  hostel: string;
  roomNo: string;
  hasCafe: boolean;
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
