"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCont } from "@/components/Context";
import { getUser, type User } from "@/lib/session";
import StudentHome from "@/components/StudentHome";
import WardenHome from "@/components/WardenHome";
import ManagerHome from "@/components/ManagerHome";

export default function Home() {
  const { isAuthenticated } = useCont();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    setUser(getUser());
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;
  if (user.role === "warden") return <WardenHome user={user} />;
  if (user.role === "manager") return <ManagerHome user={user} />;
  return <StudentHome user={user} />;
}
