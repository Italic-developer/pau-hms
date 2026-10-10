"use client";

import { useState } from "react";
import { ClipboardList, CheckCircle2, Wallet } from "lucide-react";
import { Card, Shell, Stat, StatusBadge, selectClass } from "@/components/Shell";
import { TaskBoard } from "@/components/TaskBoard";
import { type OrderStatus, type ServiceOrder } from "@/lib/store";
import type { User } from "@/lib/session";
import { useCollection } from "@/lib/useCollection";

const tabs = ["all", "laundry", "cleaning"] as const;

export default function WardenHome({ user }: { user: User }) {
    const { items: orders, error, updateItem } = useCollection<ServiceOrder>("orders");
    const [tab, setTab] = useState<(typeof tabs)[number]>("all");

    const mine = orders.filter((o) => o.hostel === user.hostelValue);
    const shown = tab === "all" ? mine : mine.filter((o) => o.kind === tab);
    const open = mine.filter((o) => o.status !== "Done").length;
    const done = mine.filter((o) => o.status === "Done");
    const earned = done.reduce((s, o) => s + o.total, 0);

    const setStatus = (id: string, status: OrderStatus) =>
        void updateItem(id, { status });

    return (
        <Shell user={user}>
            <main className="mx-auto max-w-6xl space-y-6 p-6">
                <section className="rounded-xl bg-primary p-6 text-primary-foreground">
                    <h1 className="text-2xl font-semibold">Warden dashboard</h1>
                    <p className="mt-1 text-sm opacity-80">Laundry and cleaning requests for {user.hostel}</p>
                </section>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Stat label="Open orders" value={String(open)} icon={ClipboardList} />
                    <Stat label="Completed" value={String(done.length)} icon={CheckCircle2} />
                    <Stat label="Earned" value={`₦${earned.toLocaleString()}`} icon={Wallet} />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card title="Service orders" icon={ClipboardList} className="lg:col-span-2">
                        {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
                        <div className="mb-4 flex gap-2">
                            {tabs.map((t) => (
                                <button
                                    key={t} onClick={() => setTab(t)}
                                    className={`rounded-full px-3 py-1 text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <ul className="space-y-2">
                            {shown.map((o) => (
                                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2">
                                    <div>
                                        <p className="text-sm font-medium">{o.service} × {o.qty}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {o.student} · Room {o.roomNo} · {o.date} · ₦{o.total.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={o.status} />
                                        <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)} className={selectClass}>
                                            <option>Requested</option>
                                            <option>In progress</option>
                                            <option>Done</option>
                                        </select>
                                    </div>
                                </li>
                            ))}
                            {shown.length === 0 && <p className="text-sm text-muted-foreground">No orders here.</p>}
                        </ul>
                    </Card>
                    <TaskBoard user={user} />
                </div>
            </main>
        </Shell>
    );
}
