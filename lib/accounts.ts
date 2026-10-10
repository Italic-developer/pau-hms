import type { Gender } from "@/lib/hostels";

export interface Account {
  name: string;
  password: string; // DEMO ONLY: never store plain passwords; hash on the server
  gender: Gender;
  hostelValue: string;
  roomNo: string;
}

const KEY = "hms-accounts";

export function getAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addAccount(a: Account) {
  localStorage.setItem(KEY, JSON.stringify([...getAccounts(), a]));
}

export function findAccount(name: string, password: string) {
  return getAccounts().find(
    (a) => a.name.toLowerCase() === name.trim().toLowerCase() && a.password === password
  );
}
