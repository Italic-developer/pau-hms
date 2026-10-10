"use client";
import { Shell } from "@/components/Shell";
import { ServicesCard } from "@/components/ServicesCard";
import { useShared, seedComplaints, today, type Complaint } from "@/lib/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound, BedDouble, UtensilsCrossed, MessageSquareWarning } from "lucide-react";
import { useCont } from "@/components/Context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUser, type User } from "@/lib/session";

const menu = [
    { id: 1, name: "Jollof rice & chicken", price: 2500 },
    { id: 2, name: "Fried rice & plantain", price: 2300 },
    { id: 3, name: "Beef shawarma", price: 3000 },
    { id: 4, name: "Bottled water", price: 300 },
];

const field =
    "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40";

export default function Home() {
    const { isAuthenticated } = useCont();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    const [allComplaints, setAllComplaints] = useShared<Complaint[]>("hms-complaints", seedComplaints);
    const complaints = allComplaints.filter((c) => c.student === user.name);

    const [cart, setCart] = useState<Record<number, number>>({});
    const [category, setCategory] = useState("maintenance");
    const [details, setDetails] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
        setUser(getUser());
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) return null;

    const total = menu.reduce((sum, m) => sum + m.price * (cart[m.id] ?? 0), 0);

    function submitComplaint(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        setDetails("");
        setSubmitted(true);
        setAllComplaints((c) => [
            {
                id: Date.now(), hostel: user.hostelValue, roomNo: user.roomNo, student: user.name,
                category, details, status: "Pending", date: today()
            },
            ...c,
        ]);
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="flex items-center justify-between border-b bg-card px-6 py-3">
                <span className="font-semibold text-primary">Hostel Management System</span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm">
                        <BedDouble className="size-4" /> Room {user.roomNo}
                    </span>
                    <ThemeToggle />
                    <div className="flex items-center gap-2">
                        <CircleUserRound className="size-8 text-primary" />
                        <div className="hidden leading-tight sm:block">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.hostel}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-2">
                {user.hasCafe && (
                    <section className="rounded-xl border bg-card p-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold">
                            <UtensilsCrossed className="size-5 text-primary" /> Cafe ordering
                        </h2>
                        <ul className="mt-4 divide-y">
                            {menu.map((m) => (
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
                                disabled={total === 0}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                            >
                                Place order
                            </button>
                        </div>
                    </section>
                )}

                <section className={`rounded-xl border bg-card p-6 ${user.hasCafe ? "" : "md:col-span-2"}`}>
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <MessageSquareWarning className="size-5 text-primary" /> Complaints
                    </h2>
                    <form onSubmit={submitComplaint} className="mt-4 space-y-4">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
                            <option value="maintenance">Maintenance</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="noise">Noise</option>
                            <option value="other">Other</option>
                        </select>
                        <textarea
                            required
                            rows={4}
                            value={details}
                            onChange={(e) => { setDetails(e.target.value); setSubmitted(false); }}
                            placeholder="Describe the issue..."
                            className={field}
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            Submit complaint
                        </button>
                        {submitted && <p className="text-sm text-muted-foreground">Complaint submitted. Thank you.</p>}
                    </form>
                </section>
            </main>
        </div>
    );
}
