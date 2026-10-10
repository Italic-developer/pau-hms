export type Role = "student" | "warden" | "manager";

export interface User {
  id: string;
  name: string;
  hostel: string;
  hostelValue: string;
  hasCafe: boolean;
  roomNo: string;
  role: Role;
}
