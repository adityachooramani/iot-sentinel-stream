// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Attack } from "../api";
import { API_BASE_URL } from "../config";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [latestAttacks, setLatestAttacks] = useState<Attack[]>([]);
  const [newAttack, setNewAttack] = useState<Attack | null>(null);

  useEffect(() => {
    const s = io(API_BASE_URL, { transports: ["websocket"], withCredentials: true });
    setSocket(s);

    s.on("status", () => {
      s.emit("request_latest_attacks");
    });
    s.on("latest_attacks", (data: Attack[]) => {
      setLatestAttacks(data);
    });
    s.on("new_attack", (attack: Attack) => {
      setNewAttack(attack);
      setLatestAttacks((prev) => [attack, ...prev].slice(0, 50));
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return { socket, latestAttacks, newAttack };
}
