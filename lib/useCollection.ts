"use client";

import { useCallback, useEffect, useState } from "react";

interface CollectionItem {
  id: string;
}

export function useCollection<T extends CollectionItem>(resource: string) {
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/data/${resource}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load saved data.");
        if (!active) return;
        setItems(result.items as T[]);
        setError("");
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load saved data.");
      });
    return () => { active = false; };
  }, [resource]);

  const createItem = useCallback(async (data: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/data/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save this item.");
      setItems((current) => [result.item as T, ...current]);
      setError("");
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save this item.");
      return false;
    }
  }, [resource]);

  const updateItem = useCallback(async (id: string, changes: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/data/${resource}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update this item.");
      setItems((current) => current.map((item) => item.id === id ? result.item as T : item));
      setError("");
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update this item.");
      return false;
    }
  }, [resource]);

  return { items, error, createItem, updateItem };
}
