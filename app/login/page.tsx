"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCont } from "@/components/Context";

const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40";

export default function LoginPage() {
    const router = useRouter();
    const { setIsAuthenticated } = useCont();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, password }),
            });
            const result = await response.json();
            if (!response.ok) {
                setError(result.error || "Unable to log in.");
                return;
            }
            setIsAuthenticated(true);
            router.push("/");
        } catch {
            setError("Unable to reach the server. Please try again.");
        }
    }

    return (
        <main className="grid min-h-screen lg:grid-cols-3">
            {/* Brand panel */}
            <section className="hidden flex-col justify-between bg-muted/40 p-12 text-foreground lg:flex col-span-1">
                <div className="mb-12 flex flex-row gap-4">
                    <img src="/pau-logo2.png" alt="Logo" className="h-12 w-auto aspect-square" />
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                        Hostel Management System
                    </span>
                </div>
                <div>
                    <h1 className="text-4xl font-semibold leading-tight text-primary">
                        Hotel comfort, hostel life.
                    </h1>
                    <p className="mt-4 max-w-md text-muted-foreground">
                        Sign in with your details to continue.
                    </p>
                </div>
                <span className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} All rights reserved
                </span>
            </section>

            {/* Form panel */}
            <section className="flex items-center justify-center bg-primary px-6 py-12 col-span-2">
                <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-lg">
                    <h2 className="text-2xl font-semibold">Welcome back</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Log in to your account</p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <input id="name" type="text" required value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name" className={inputClass} />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <input id="password" type="password" required value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password" className={inputClass} />
                        </div>

                        {error && (
                            <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-500/15 dark:text-red-300">
                                {error}
                            </p>
                        )}

                        <button type="submit"
                            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/50">
                            Log in
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
