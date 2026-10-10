export type Gender = "male" | "female";

export interface RoomOption {
  size: 1 | 2 | 3;
  label: string;
  price: number;     // per session, naira
  total: number;     // rooms of this size
  available: number; // rooms left
}

export interface Hostel {
  value: string;
  label: string;
  gender: Gender;
  hue: number; // theme color (0-360)
  hasCafe: boolean;
  description: string;
  rooms: RoomOption[];
}

const room = (size: 1 | 2 | 3, price: number, total: number, available: number): RoomOption => ({
  size, label: `${size}-man room`, price, total, available,
});

export const hostels: Hostel[] = [
  { value: "amethyst", label: "Amethyst", gender: "male", hue: 305, hasCafe: true,
    description: "Cafe on site, close to the main gate",
    rooms: [room(1, 450000, 10, 3), room(2, 320000, 20, 8), room(3, 250000, 15, 0)] },
  { value: "jasper", label: "Jasper", gender: "male", hue: 150, hasCafe: false,
    description: "Quiet block near the sports complex",
    rooms: [room(1, 500000, 8, 0), room(2, 350000, 20, 6), room(3, 270000, 15, 9)] },
  { value: "faith", label: "Faith", gender: "female", hue: 250, hasCafe: false,
    description: "Quiet block, near the library",
    rooms: [room(1, 400000, 8, 0), room(2, 290000, 20, 5), room(3, 220000, 15, 12)] },
  { value: "pearl", label: "Pearl", gender: "female", hue: 10, hasCafe: true,
    description: "Newest block with a cafe",
    rooms: [room(1, 480000, 10, 2), room(2, 340000, 20, 7), room(3, 260000, 15, 4)] },
];

export const getHostel = (value: string) => hostels.find((h) => h.value === value);
