"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Card, selectClass } from "@/components/Shell";
import { type Task } from "@/lib/store";
import type { User } from "@/lib/session";
import { useCollection } from "@/lib/useCollection";

export function TaskBoard({ user }: { user: User }) {
    const me = user.role as "warden" | "manager";
    const other = me === "warden" ? "manager" : "warden";
    const { items: tasks, error, createItem, updateItem } = useCollection<Task>("tasks");
    const [title, setTitle] = useState("");
    const [to, setTo] = useState<"warden" | "manager">(other);

    const mine = tasks.filter((t) => t.hostel === user.hostelValue);

    async function add(e: React.FormEvent) {
        e.preventDefault();
        if (await createItem({ title, to })) setTitle("");
    }

    const toggle = (id: string, done: boolean) =>
        void updateItem(id, { done: !done });

    return (
        <Card title="Shared tasks" icon={ListChecks}>
            <form onSubmit={add} className="flex flex-wrap gap-2">
                <input
                    required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="New task..."
                    className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                />
                <select value={to} onChange={(e) => setTo(e.target.value as "warden" | "manager")} className={selectClass}>
                    <option value="warden">For warden</option>
                    <option value="manager">For manager</option>
                </select>
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add</button>
            </form>
            {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            <ul className="mt-4 space-y-2">
                {mine.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2">
                        <input type="checkbox" checked={t.done} onChange={() => toggle(t.id, t.done)} className="size-4 accent-[var(--primary)]" />
                        <div className="flex-1">
                            <p className={`text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
                            <p className="text-xs capitalize text-muted-foreground">
                                {t.from} → {t.to}{t.to === me && !t.done ? " · assigned to you" : ""} · {t.date}
                            </p>
                        </div>
                    </li>
                ))}
                {mine.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
            </ul>
        </Card>
    );
}
