"use client";

import { DoorOpen, MessageSquareWarning, Percent } from "lucide-react";
import { Card, Shell, Stat, StatusBadge, selectClass } from "@/components/Shell";
import { TaskBoard } from "@/components/TaskBoard";
import { getHostel } from "@/lib/hostels";
import { roomsLeft, type Complaint, type ComplaintStatus } from "@/lib/store";
import type { User } from "@/lib/session";
import { useCollection } from "@/lib/useCollection";
import { useRoomAvailability } from "@/lib/useRoomAvailability";

export default function ManagerHome({ user }: { user: User }) {
    const hostel = getHostel(user.hostelValue);
    const { items: complaints, error: complaintError, updateItem } = useCollection<Complaint>("complaints");
    const { taken, error: availabilityError } = useRoomAvailability();

    if (!hostel) return null;
    const rooms = hostel.rooms.map((r) => ({
        ...r,
        available: roomsLeft(taken, hostel.value, r.size, r.available),
    }));
    const hostelComplaints = complaints;
    const total = rooms.reduce((s, r) => s + r.total, 0);
    const free = rooms.reduce((s, r) => s + r.available, 0);
    const open = hostelComplaints.filter((c) => c.status !== "Resolved").length;

    const setStatus = (id: string, status: ComplaintStatus) =>
        void updateItem(id, { status });

    return (
        <Shell user={user}>
            <main className="mx-auto max-w-6xl space-y-6 p-6">
                <section className="rounded-xl bg-primary p-6 text-primary-foreground">
                    <h1 className="text-2xl font-semibold">Manager dashboard</h1>
                    <p className="mt-1 text-sm opacity-80">Capacity and complaints for {user.hostel}</p>
                </section>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Stat label="Occupancy" value={`${Math.round(((total - free) / total) * 100)}%`} icon={Percent} />
                    <Stat label="Rooms free" value={`${free} of ${total}`} icon={DoorOpen} />
                    <Stat label="Open complaints" value={String(open)} icon={MessageSquareWarning} />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card title="Room capacity" icon={DoorOpen}>
                            <ul className="space-y-4">
                                {hostel.rooms.map((r) => {
                                    const used = r.total - r.available;
                                    return (
                                        <li key={r.size}>
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{r.label}</span>
                                                <span className="text-muted-foreground">{used}/{r.total} taken · {r.available} free</span>
                                            </div>
                                            <div className="mt-1.5 h-2 rounded-full bg-muted">
                                                <div className="h-2 rounded-full bg-primary" style={{ width: `${(used / r.total) * 100}%` }} />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Card>

                        <Card title="Complaints" icon={MessageSquareWarning}>
                            {(complaintError || availabilityError) && (
                                <p role="alert" className="mb-3 text-sm text-red-700">{complaintError || availabilityError}</p>
                            )}
                            <ul className="space-y-2">
                                {hostelComplaints.map((c) => (
                                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2">
                                        <div>
                                            <p className="text-sm font-medium">{c.category}: {c.details}</p>
                                            <p className="text-xs text-muted-foreground">{c.student} · Room {c.roomNo} · {c.date}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={c.status} />
                                            <select value={c.status} onChange={(e) => setStatus(c.id, e.target.value as ComplaintStatus)} className={selectClass}>
                                                <option>Pending</option>
                                                <option>In progress</option>
                                                <option>Resolved</option>
                                            </select>
                                        </div>
                                    </li>
                                ))}
                                {hostelComplaints.length === 0 && <p className="text-sm text-muted-foreground">No complaints.</p>}
                            </ul>
                        </Card>
                    </div>
                    <TaskBoard user={user} />
                </div>
            </main>
        </Shell>
    );
}
