import { useState, useEffect } from "react";
import { Shield, Camera, Lock, Router, Activity } from "lucide-react";
import { AttackTimeline } from "./AttackTimeline";
import { RecentAttacks } from "./RecentAttacks";
import { DeviceStatus } from "./DeviceStatus";
import { AttackMetrics } from "./AttackMetrics";
import { useToast } from "@/hooks/use-toast";

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

  // Replace with your actual Railway backend API endpoint
  const BACKEND_URL = "https://iot-honeypot-production-a864.up.railway.app";

  // Fetch initial attacks on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/attacks`);
        const data = await res.json();
        setAttacks(data.attacks || []);
        setTotalAttacks(data.totalAttacks || 0);
      } catch (err) {
        console.error("Error fetching initial attacks:", err);
      }
    };

    fetchInitialData();
  }, []);

  // Poll for new attacks every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/attacks/latest`);
        const newAttack = await res.json();

        if (newAttack && newAttack.id) {
          setAttacks((prev) => [newAttack, ...prev.slice(0, 49)]); // Keep last 50
          setTotalAttacks((prev) => prev + 1);

          // Toast notification for new attack
          toast({
            title: "🚨 New Attack Detected",
            description: `Attack on ${newAttack.endpoint} from ${newAttack.sourceIP}`,
            className: "border-destructive bg-destructive/10",
          });
        }
      } catch (err) {
        console.error("Error fetching latest attack:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [toast]);

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
