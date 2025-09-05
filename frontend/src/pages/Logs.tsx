import { useEffect, useState } from "react";
import { AttackLogs } from "@/components/AttackLogs";
import { fetchAttacks, type Attack } from "@/api";
import { useSocket } from "@/hooks/useSocket";

const Logs = () => {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { newAttack } = useSocket();

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchAttacks();
      // Convert timestamps to Date for AttackLogs component
      setAttacks(
        data.map((a) => ({ ...a, timestamp: new Date(a.timestamp) })) as unknown as Attack[]
      );
      setError(null);
    } catch (e) {
      setError("Failed to load attacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!newAttack) return;
    setAttacks(prev => [{ ...newAttack, timestamp: new Date(newAttack.timestamp) } as any, ...prev].slice(0, 200));
  }, [newAttack]);

  if (loading) {
    return <div className="flex-1 p-6">Loading...</div>;
  }
  if (error) {
    return <div className="flex-1 p-6 text-destructive">{error}</div>;
  }

  return <AttackLogs attacks={attacks as unknown as any[]} />;
};

export default Logs;


