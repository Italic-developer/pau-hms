"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/session";
import StudentHome from "@/components/StudentHome";
import WardenHome from "@/components/WardenHome";
import ManagerHome from "@/components/ManagerHome";
import { useCont } from "@/components/Context";

export default function Home() {
  const { isAuthenticated, setIsAuthenticated } = useCont();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { router.replace("/login"); return; }
        setUser(data.user);
        setIsAuthenticated(true);
      });
  }, [router, setIsAuthenticated]);

  if (!user) return null;
  if (user.role === "warden") return <WardenHome user={user} />;
  if (user.role === "manager") return <ManagerHome user={user} />;
  return <StudentHome user={user} />;
}
