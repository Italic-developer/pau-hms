"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, CircleUserRound, LogOut } from "lucide-react";
import { useCont } from "@/components/Context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getHostel } from "@/lib/hostels";
import type { User } from "@/lib/session";

export function Shell({ user, children }: { user: User; children: ReactNode }) {
    const router = useRouter();
    const { setIsAuthenticated } = useCont();
    const [logoutError, setLogoutError] = useState("");
    const hue = getHostel(user.hostelValue)?.hue ?? 260;

    async function logout() {
        setLogoutError("");
        try {
            const response = await fetch("/api/auth/logout", { method: "POST" });
            if (!response.ok) throw new Error("Unable to log out. Please try again.");
            setIsAuthenticated(false);
            router.replace("/login");
        } catch (cause) {
            setLogoutError(cause instanceof Error ? cause.message : "Unable to log out.");
        }
    }

    return (
        <div data-hostel style={{ "--hue": hue } as CSSProperties} className="min-h-screen bg-muted/40">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-6 py-3">
                <span className="font-semibold text-primary">{user.hostel} Hostel</span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm capitalize">
                        {user.role === "student" ? (
                            <><BedDouble className="size-4" /> Room {user.roomNo}</>
                        ) : (
                            user.role
                        )}
                    </span>
                    <ThemeToggle />
                    <div className="flex items-center gap-2">
                        <CircleUserRound className="size-8 text-primary" />
                        <p className="hidden text-sm font-medium sm:block">{user.name}</p>
                    </div>
                    <button onClick={logout} aria-label="Log out" className="flex size-9 items-center justify-center rounded-md border hover:bg-accent">
                        <LogOut className="size-4" />
                    </button>
                </div>
            </header>
            {logoutError && <p role="alert" className="px-6 pt-3 text-sm text-red-700">{logoutError}</p>}
            {children}
        </div>
    );
}

export function Card({ title, icon: Icon, children, className = "" }: {
    title: string; icon: ElementType; children: ReactNode; className?: string;
}) {
    return (
        <section className={`rounded-xl border bg-card p-6 ${className}`}>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Icon className="size-5 text-primary" /> {title}
            </h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

export function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: ElementType }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold">{value}</p>
            </div>
        </div>
    );
}

const badge: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    Requested: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    "In progress": "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    Done: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
};

export function StatusBadge({ status }: { status: string }) {
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge[status] ?? ""}`}>{status}</span>;
}

export const selectClass =
    "rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";
