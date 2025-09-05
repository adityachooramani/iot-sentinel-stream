import { useState, useEffect } from "react";
import { Shield, Camera, Lock, Router, Activity } from "lucide-react";
import { AttackTimeline } from "./AttackTimeline";
import { RecentAttacks } from "./RecentAttacks";
import { DeviceStatus } from "./DeviceStatus";
import { AttackMetrics } from "./AttackMetrics";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config";
import { useSocket } from "@/hooks/useSocket";

interface Attack {
  id: string;
  timestamp: string;
  sourceIP: string;
  endpoint: string;
  method: string;
  payload?: string;
  blocked: boolean;
}

const mockDevices = [
  { id: "camera", name: "IoT Camera", icon: Camera, status: "online" as const },
  { id: "lock", name: "Smart Lock", icon: Lock, status: "online" as const },
  { id: "router", name: "IoT Router", icon: Router, status: "online" as const },
];

export const Dashboard = () => {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [totalAttacks, setTotalAttacks] = useState(0);
  const { toast } = useToast();

  const { latestAttacks, newAttack } = useSocket();

  // Fetch initial attacks and stats on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [attacksRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/attacks`),
          fetch(`${API_BASE_URL}/api/stats`),
        ]);
        const attacksJson = await attacksRes.json();
        const statsJson = await statsRes.json();
        const list = (attacksJson.data || []).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }));
        setAttacks(list);
        setTotalAttacks(statsJson?.data?.totalAttacks || list.length);
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };

    fetchInitialData();
  }, []);

  // Handle websocket-delivered new attacks
  useEffect(() => {
    if (!newAttack) return;
    const attack = { ...newAttack, timestamp: new Date(newAttack.timestamp) } as any;
    setAttacks((prev) => [attack, ...prev].slice(0, 50));
    setTotalAttacks((prev) => prev + 1);
    toast({
      title: "🚨 New Attack Detected",
      description: `Attack on ${attack.endpoint} from ${attack.sourceIP}`,
      className: "border-destructive bg-destructive/10",
    });
  }, [newAttack, toast]);

  // Keep local list in sync with latestAttacks bootstrap data
  useEffect(() => {
    if (latestAttacks.length > 0) {
      const list = latestAttacks.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }));
      setAttacks(list);
    }
  }, [latestAttacks]);

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-primary honeypot-glow" />
        <div>
          <h1 className="text-3xl font-bold glow-text">IoT HoneyNet Dashboard</h1>
          <p className="text-secondary">Real-time IoT security monitoring</p>
        </div>
      </div>

      {/* Attack Metrics */}
      <AttackMetrics attacks={attacks} totalAttacks={totalAttacks} />

      {/* Device Status */}
      <DeviceStatus devices={mockDevices} />

      {/* Charts and Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AttackTimeline attacks={attacks} />
        <RecentAttacks attacks={attacks} />
      </div>

      {/* Live Monitoring Indicator */}
      <div className="fixed bottom-6 right-6">
        <div className="flex items-center gap-2 bg-card border border-border/50 rounded-full px-4 py-2 panel-gradient">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            <span className="text-primary">●</span> Live Monitoring
          </span>
        </div>
      </div>
    </div>
  );
};
