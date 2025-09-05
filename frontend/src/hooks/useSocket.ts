// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import type { Attack } from "../api";
import { fetchLatestAttack } from "../api";

export function useSocket() {
  const [latestAttacks, setLatestAttacks] = useState<Attack[]>([]);
  const [newAttack, setNewAttack] = useState<Attack | null>(null);

  useEffect(() => {
    let isMounted = true;
    let lastSeenId: string | null = null;

    const tick = async () => {
      try {
        const latest = await fetchLatestAttack();
        if (!isMounted || !latest) return;

        // Update rolling list
        setLatestAttacks((prev) => {
          const existing = prev.find((a) => a.id === latest.id);
          if (existing) return prev;
          const next = [latest, ...prev];
          return next.slice(0, 50);
        });

        // Emit new item event-like update
        if (lastSeenId !== latest.id) {
          lastSeenId = latest.id;
          setNewAttack(latest);
        }
      } catch (e) {
        // ignore transient errors during polling
      }
    };

    // Prime immediately, then poll
    tick();
    const interval = setInterval(tick, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { socket: null, latestAttacks, newAttack };
}
