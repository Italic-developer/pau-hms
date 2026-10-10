"use client";

import { useEffect, useState } from "react";

export function useRoomAvailability() {
  const [taken, setTaken] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/room-availability", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load room availability.");
        if (active) setTaken(result.taken as Record<string, number>);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load room availability.");
      });
    return () => { active = false; };
  }, []);

  return { taken, error };
}
