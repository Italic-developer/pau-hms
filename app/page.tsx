"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/session";
import StudentHome from "@/components/StudentHome";
import WardenHome from "@/components/WardenHome";
import ManagerHome from "@/components/ManagerHome";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          router.replace("/login");
          return;
        }
        const result = await response.json();
        if (active) setUser(result.user as User);
      })
      .catch(() => router.replace("/login"))
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => { active = false; };
  }, [router]);

  if (checkingSession || !user) return null;
  if (user.role === "warden") return <WardenHome user={user} />;
  if (user.role === "manager") return <ManagerHome user={user} />;
  return <StudentHome user={user} />;
}
