import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";
import type { Attack } from "@/api";
import { fetchAttacks } from "@/api";

const DeviceRouter = () => {
  const [recent, setRecent] = useState<Attack[]>([]);
  useEffect(() => {
    fetchAttacks().then(list => setRecent(list.filter(a => a.endpointincludes && a.endpoint.includes("router")).slice(0, 5)));
  }, []);
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold">IoT Router</h1>
      <p className="text-secondary">Simulated device endpoint: /honeypot/router</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl overflow-hidden border border-border/50">
            <img src="/placeholder.svg" alt="Router" className="w-full h-64 object-cover bg-[#273a34]" />
          </div>
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recent.map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm border border-border/50 rounded p-2">
                  <span className="font-mono text-secondary truncate">{new Date(a.timestamp).toLocaleString()}</span>
                  <span className="truncate">{a.method} {a.endpoint}</span>
                  <span className="font-mono">{a.sourceIP}</span>
                </div>
              ))}
              {recent.length === 0 && <div className="text-secondary text-sm">No recent activity</div>}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-3">Device Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-secondary">Model</span><span>WiFi Router</span></div>
              <div className="flex justify-between"><span className="text-secondary">IP</span><span className="font-mono text-[#0bda49]">192.168.1.1</span></div>
              <div className="flex justify-between"><span className="text-secondary">Location</span><span>Server Room</span></div>
              <div className="flex justify-between"><span className="text-secondary">Firmware</span><span>4.2.8</span></div>
              <div className="flex justify-between"><span className="text-secondary">Status</span><span className="text-green-400">Online</span></div>
            </div>
          </div>
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-3">Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={async () => { await fetch(`${API_BASE_URL}/honeypot/router`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reboot" }) }); }}>Reboot</Button>
              <Button variant="outline" onClick={async () => { await fetch(`${API_BASE_URL}/honeypot/router`, { method: "GET" }); }}>Status</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceRouter;


