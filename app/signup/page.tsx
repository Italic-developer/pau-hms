"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useCont } from "@/components/Context";
import { getHostel, hostels, type Gender } from "@/lib/hostels";
import { roomsLeft } from "@/lib/store";
import { useRoomAvailability } from "@/lib/useRoomAvailability";

const steps = ["Account", "Hostel", "Room", "Review"];
const naira = (n: number) => `₦${n.toLocaleString()}`;

const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40";
const primaryBtn =
    "w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";
const tag = "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium";
const green = "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300";
const red = "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300";
const errorBox = "mt-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-500/15 dark:text-red-300";
const choice = (selected: boolean) =>
    `flex w-full items-center justify-between rounded-lg border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "hover:bg-accent"
    }`;

export default function SignupPage() {
    const router = useRouter();
    const { setIsAuthenticated } = useCont();
    const { taken, error: availabilityError } = useRoomAvailability();

    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState<Gender | "">("");
    const [hostelValue, setHostelValue] = useState("");
    const [roomSize, setRoomSize] = useState<number | null>(null);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    const hostel = getHostel(hostelValue);
    const room = hostel?.rooms.find((r) => r.size === roomSize);
    const options = hostels.filter((h) => h.gender === gender);
    const canContinue = [gender !== "", !!hostel, !!room, true][step];

    function pickGender(g: Gender) {
        setGender(g);
        setHostelValue(""); // hostels differ per gender
        setRoomSize(null);
    }

    function pickHostel(v: string) {
        setHostelValue(v);
        setRoomSize(null);
    }

    async function createAccount() {
        if (!hostel || !room) return;
        setPaying(true);
        setError("");

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, password, gender, hostelValue, roomSize: room.size }),
            });
            const result = await response.json();
            if (!response.ok) {
                setError(result.error || "Unable to create your account.");
                if (response.status === 409) setStep(2);
                return;
            }
            setIsAuthenticated(true);
            router.push("/");
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setPaying(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (step === 3) void createAccount();
        else setStep((s) => s + 1);
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
                        Create your account, choose your room and pay online. It takes about a minute.
                    </p>
                </div>
                <span className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} All rights reserved
                </span>
            </section>

            {/* Form panel */}
            <section className="flex items-center justify-center bg-primary px-6 py-12 col-span-2">
                <div className="w-full max-w-lg rounded-xl border bg-card p-8 shadow-lg">
                    {/* Progress */}
                    <ol className="mb-8 flex items-center">
                        {steps.map((label, i) => (
                            <li key={label} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
                                <span
                                    className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {i < step ? <Check className="size-4" /> : i + 1}
                                </span>
                                <span className={`ml-2 hidden text-xs sm:block ${i === step ? "font-medium" : "text-muted-foreground"}`}>
                                    {label}
                                </span>
                                {i < steps.length - 1 && (
                                    <div className={`mx-3 h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />
                                )}
                            </li>
                        ))}
                    </ol>

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: account */}
                        {step === 0 && (
                            <>
                                <h2 className="text-2xl font-semibold">Create your account</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Start with your details</p>
                                {error && <p className={errorBox}>{error}</p>}
                                <div className="mt-8 space-y-5">
                                    <div className="space-y-1.5">
                                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                                        <input id="name" type="text" required value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name" className={inputClass} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                                        <input id="password" type="password" required minLength={6} value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="At least 6 characters" className={inputClass} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-sm font-medium">Gender</span>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(["male", "female"] as const).map((g) => (
                                                <button key={g} type="button" onClick={() => pickGender(g)}
                                                    className={`rounded-md border px-3 py-2.5 text-sm capitalize transition ${gender === g ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "hover:bg-accent"
                                                        }`}>
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 2: hostel (filtered by gender) */}
                        {step === 1 && (
                            <>
                                <h2 className="text-2xl font-semibold">Choose your hostel</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Hostels for {gender} students</p>
                                {availabilityError && <p role="alert" className={errorBox}>{availabilityError}</p>}
                                <div className="mt-6 space-y-3">
                                    {options.map((h) => {
                                        const full = h.rooms.every(
                                            (r) => roomsLeft(taken, h.value, r.size, r.available) === 0
                                        );
                                        return (
                                            <button key={h.value} type="button" disabled={full}
                                                onClick={() => pickHostel(h.value)} className={choice(hostelValue === h.value)}>
                                                <div>
                                                    <p className="font-medium">{h.label}</p>
                                                    <p className="text-sm text-muted-foreground">{h.description}</p>
                                                </div>
                                                <span className={`${tag} ${full ? red : green}`}>
                                                    {full ? "Fully booked" : "Rooms available"}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Step 3: room size */}
                        {step === 2 && hostel && (
                            <>
                                <h2 className="text-2xl font-semibold">Pick a room size</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Rooms in {hostel.label}</p>
                                {error && <p className={errorBox}>{error}</p>}
                                <div className="mt-6 space-y-3">
                                    {hostel.rooms.map((r) => {
                                        const left = roomsLeft(taken, hostel.value, r.size, r.available);
                                        return (
                                            <button key={r.size} type="button" disabled={left === 0}
                                                onClick={() => setRoomSize(r.size)} className={choice(roomSize === r.size)}>
                                                <div>
                                                    <p className="font-medium">{r.label}</p>
                                                    <p className="text-sm text-muted-foreground">{naira(r.price)} per session</p>
                                                </div>
                                                <span className={`${tag} ${left === 0 ? red : green}`}>
                                                    {left === 0 ? "Full" : `${left} left`}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Step 4: payment */}
                        {step === 3 && hostel && room && (
                            <>
                                <h2 className="text-2xl font-semibold">Review your booking</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Payment is not connected; continuing will reserve your room without charging you.</p>
                                {error && <p className={errorBox}>{error}</p>}
                                <dl className="mt-6 divide-y rounded-lg border text-sm">
                                    {[
                                        ["Name", name],
                                        ["Hostel", hostel.label],
                                        ["Room", room.label],
                                        ["Amount", naira(room.price)],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between px-4 py-3">
                                            <dt className="text-muted-foreground">{k}</dt>
                                            <dd className="font-medium">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </>
                        )}

                        {/* Navigation */}
                        <div className="mt-8 flex gap-3">
                            {step > 0 && (
                                <button type="button" disabled={paying}
                                    onClick={() => { setError(""); setStep((s) => s - 1); }}
                                    className="flex items-center gap-1 rounded-md border px-4 py-2.5 text-sm hover:bg-accent disabled:opacity-50">
                                    <ArrowLeft className="size-4" /> Back
                                </button>
                            )}
                            <button type="submit" disabled={!canContinue || paying} className={primaryBtn}>
                                {paying ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="size-4 animate-spin" /> Creating account...
                                    </span>
                                ) : step === 3 && room ? (
                                    "Create account"
                                ) : (
                                    "Continue"
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already registered?{" "}
                        <Link href="/login" className="font-medium text-primary hover:underline">Login</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
