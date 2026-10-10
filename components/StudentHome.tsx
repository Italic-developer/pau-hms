"use client";

import { useState } from "react";
import {
    BedDouble, CalendarDays, CircleUserRound, Clock, Megaphone,
    MessageSquareWarning, Phone, ShoppingBag, UtensilsCrossed, Users, Wallet,
} from "lucide-react";
import { Card, Shell, Stat, StatusBadge } from "@/components/Shell";
import { ServicesCard } from "@/components/ServicesCard";
import { announcements, contacts, roommates } from "@/lib/mock";
import { cafeMenu, type Complaint } from "@/lib/store";
import type { User } from "@/lib/session";
import { useCollection } from "@/lib/useCollection";

interface CafeOrder {
    id: string;
    items: string;
    total: number;
    date: string;
}

const field =
    "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40";

export default function StudentHome({ user }: { user: User }) {
    const [cart, setCart] = useState<Record<number, number>>({});
    const { items: cafeOrders, error: cafeError, createItem: createCafeOrder } = useCollection<CafeOrder>("cafe-orders");
    const { items: complaints, error: complaintError, createItem: createComplaint } = useCollection<Complaint>("complaints");
    const [category, setCategory] = useState("Maintenance");
    const [details, setDetails] = useState("");

    const total = cafeMenu.reduce((sum, m) => sum + m.price * (cart[m.id] ?? 0), 0);
    const openComplaints = complaints.filter((c) => c.status !== "Resolved").length;
    const firstName = user.name.split(" ")[0];

    async function placeOrder() {
        const items = cafeMenu
            .filter((m) => (cart[m.id] ?? 0) > 0)
            .map((m) => ({ id: m.id, quantity: cart[m.id] }));
        if (await createCafeOrder({ items })) setCart({});
    }

    async function submitComplaint(e: React.FormEvent) {
        e.preventDefault();
        if (await createComplaint({ category, details })) setDetails("");
    }

    const stats = [
        { label: "Your room", value: user.roomNo, icon: BedDouble },
        { label: "Hostel fees", value: "Paid", icon: Wallet },
        { label: "Open complaints", value: String(openComplaints), icon: MessageSquareWarning },
        { label: "Next inspection", value: "Fri, Oct 16", icon: CalendarDays },
    ];

    return (
        <Shell user={user}>
            <main className="mx-auto max-w-6xl space-y-6 p-6">
                {/* Welcome banner */}
                <section className="rounded-xl bg-primary p-6 text-primary-foreground">
                    <p className="text-sm opacity-80">
                        {new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold">Welcome back, {firstName}</h1>
                    <p className="mt-1 text-sm opacity-80">
                        {user.hostel} Hostel · Room {user.roomNo}
                    </p>
                </section>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((s) => (
                        <Stat key={s.label} {...s} />
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left column */}
                    <div className="space-y-6 lg:col-span-2">
                        {user.hasCafe && (
                            <Card title="Cafe ordering" icon={UtensilsCrossed}>
                                <ul className="divide-y">
                                    {cafeMenu.map((m) => (
                                        <li key={m.id} className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="text-sm font-medium">{m.name}</p>
                                                <p className="text-xs text-muted-foreground">₦{m.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {(cart[m.id] ?? 0) > 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => setCart((c) => ({ ...c, [m.id]: c[m.id] - 1 }))}
                                                            className="size-7 rounded-md border hover:bg-accent"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-4 text-center text-sm">{cart[m.id]}</span>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => setCart((c) => ({ ...c, [m.id]: (c[m.id] ?? 0) + 1 }))}
                                                    className="size-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 flex items-center justify-between border-t pt-4">
                                    <span className="text-sm font-medium">Total: ₦{total.toLocaleString()}</span>
                                    <button
                                        onClick={placeOrder}
                                        disabled={total === 0}
                                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        Place order
                                    </button>
                                </div>

                                {cafeOrders.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                            <ShoppingBag className="size-4 text-primary" /> Recent orders
                                        </h3>
                                        <ul className="space-y-2">
                                            {cafeOrders.map((o) => (
                                                <li key={o.id} className="flex items-start justify-between gap-4 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                                                    <span>{o.items}</span>
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        ₦{o.total.toLocaleString()} · {o.date}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {cafeError && <p role="alert" className="mt-3 text-sm text-red-700">{cafeError}</p>}
                            </Card>
                        )}

                        <ServicesCard />

                        <Card title="Complaints" icon={MessageSquareWarning}>
                            {complaintError && <p role="alert" className="mb-3 text-sm text-red-700">{complaintError}</p>}
                            <form onSubmit={submitComplaint} className="space-y-4">
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
                                    <option>Maintenance</option>
                                    <option>Cleaning</option>
                                    <option>Noise</option>
                                    <option>Other</option>
                                </select>
                                <textarea
                                    required
                                    rows={3}
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Describe the issue..."
                                    className={field}
                                />
                                <button
                                    type="submit"
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                                >
                                    Submit complaint
                                </button>
                            </form>

                            <h3 className="mb-2 mt-6 flex items-center gap-2 text-sm font-semibold">
                                <Clock className="size-4 text-primary" /> Your complaints
                            </h3>
                            <ul className="space-y-2">
                                {complaints.map((c) => (
                                    <li key={c.id} className="flex items-start justify-between gap-4 rounded-lg bg-muted/60 px-3 py-2">
                                        <div>
                                            <p className="text-sm font-medium">{c.category}</p>
                                            <p className="text-sm text-muted-foreground">{c.details}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <StatusBadge status={c.status} />
                                            <p className="mt-1 text-xs text-muted-foreground">{c.date}</p>
                                        </div>
                                    </li>
                                ))}
                                {complaints.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No complaints yet.</p>
                                )}
                            </ul>
                        </Card>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        <Card title="Announcements" icon={Megaphone}>
                            <ul className="space-y-4">
                                {announcements.map((a) => (
                                    <li key={a.id}>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-medium">{a.title}</p>
                                            <span className="text-xs text-muted-foreground">{a.date}</span>
                                        </div>
                                        <p className="mt-0.5 text-sm text-muted-foreground">{a.body}</p>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card title="Roommates" icon={Users}>
                            <ul className="space-y-3">
                                {roommates.map((r) => (
                                    <li key={r.id} className="flex items-center gap-3">
                                        <CircleUserRound className="size-8 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{r.name}</p>
                                            <p className="text-xs text-muted-foreground">{r.course}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card title="Hostel contacts" icon={Phone}>
                            <ul className="space-y-3">
                                {contacts.map((c) => (
                                    <li key={c.id} className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{c.role}</span>
                                        <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                                            {c.phone}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            </main>
        </Shell>
    );
}
