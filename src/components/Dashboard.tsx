import { useState, useEffect } from "react";
import { Shield, Camera, Lock, Router, AlertTriangle, Activity } from "lucide-react";
import { AttackTimeline } from "./AttackTimeline";
import { RecentAttacks } from "./RecentAttacks";
import { DeviceStatus } from "./DeviceStatus";
import { AttackMetrics } from "./AttackMetrics";
import { useToast } from "@/hooks/use-toast";

interface Attack {
  id: string;
  timestamp: Date;
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

const generateMockAttack = (): Attack => {
  const endpoints = ["/honeypot/camera", "/honeypot/lock", "/honeypot/router"];
  const methods = ["GET", "POST", "PUT", "DELETE"];
  const ips = ["192.168.1.100", "10.0.0.50", "172.16.0.200", "203.0.113.5", "198.51.100.10"];
  const payloads = [
    '{"username":"admin","password":"123456"}',
    '{"cmd":"cat /etc/passwd"}',
    '{"exploit":"buffer_overflow"}',
    '{"injection":"$(rm -rf /)"}',
    null
  ];

  return {
    id: Date.now().toString(),
    timestamp: new Date(),
    sourceIP: ips[Math.floor(Math.random() * ips.length)],
    endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
    method: methods[Math.floor(Math.random() * methods.length)],
    payload: payloads[Math.floor(Math.random() * payloads.length)] || undefined,
    blocked: Math.random() > 0.2, // 80% blocked
  };
};

export const Dashboard = () => {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [totalAttacks, setTotalAttacks] = useState(1247);
  const { toast } = useToast();

  // Simulate real-time attack detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance of new attack every 5 seconds
        const newAttack = generateMockAttack();
        setAttacks(prev => [newAttack, ...prev.slice(0, 49)]); // Keep last 50
        setTotalAttacks(prev => prev + 1);
        
        // Show toast notification
        toast({
          title: "🚨 New Attack Detected",
          description: `Attack on ${newAttack.endpoint} from ${newAttack.sourceIP}`,
          className: "border-destructive bg-destructive/10",
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [toast]);

  // Generate initial attacks
  useEffect(() => {
    const initialAttacks = Array.from({ length: 20 }, () => {
      const attack = generateMockAttack();
      attack.timestamp = new Date(Date.now() - Math.random() * 86400000); // Random time in last 24h
      return attack;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setAttacks(initialAttacks);
  }, []);

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

      {/* Device Status Grid */}
      <DeviceStatus devices={mockDevices} />

      {/* Charts and Logs Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AttackTimeline attacks={attacks} />
        <RecentAttacks attacks={attacks} />
      </div>

      {/* Real-time Status Indicator */}
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