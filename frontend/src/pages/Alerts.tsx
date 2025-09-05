import { useEffect, useMemo, useState } from "react";
import type { Attack } from "@/api";
import { fetchAttacks } from "@/api";
import { useSocket } from "@/hooks/useSocket";

const severity = (attack: Attack) => (attack.blocked ? "High" : "Low");

const Alerts = () => {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const { newAttack, latestAttacks } = useSocket();

  useEffect(() => {
    fetchAttacks().then((list) => setAttacks(list.slice(0, 50)));
  }, []);

  useEffect(() => {
    if (latestAttacks.length) {
      setAttacks(latestAttacks.slice(0, 50));
    }
  }, [latestAttacks]);

  useEffect(() => {
    if (!newAttack) return;
    setAttacks((prev) => [newAttack, ...prev].slice(0, 50));
  }, [newAttack]);

  const filtered = useMemo(() => {
    return attacks.filter((a) => {
      const device = a.endpoint.includes("camera")
        ? "camera"
        : a.endpoint.includes("router")
        ? "router"
        : a.endpoint.includes("lock")
        ? "lock"
        : "other";
      const sev = severity(a).toLowerCase();
      const typeOk = typeFilter === "all" || a.method.toLowerCase() === typeFilter;
      const sevOk = severityFilter === "all" || sev === severityFilter;
      const devOk = deviceFilter === "all" || device === deviceFilter;
      return typeOk && sevOk && devOk;
    });
  }, [attacks, typeFilter, deviceFilter, severityFilter]);

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-3xl font-bold">Real-time Attack Feed</h1>
        <span className="text-red-400 text-sm font-medium">LIVE</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-8 rounded-xl bg-[#273a34] text-white text-sm font-medium px-4 pr-8 border-0"
        >
          <option value="all">All Methods</option>
          <option value="get">GET</option>
          <option value="post">POST</option>
          <option value="put">PUT</option>
          <option value="delete">DELETE</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="h-8 rounded-xl bg-[#273a34] text-white text-sm font-medium px-4 pr-8 border-0"
        >
          <option value="all">All Severities</option>
          <option value="high">High</option>
          <option value="low">Low</option>
        </select>

        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="h-8 rounded-xl bg-[#273a34] text-white text-sm font-medium px-4 pr-8 border-0"
        >
          <option value="all">All Devices</option>
          <option value="camera">Camera</option>
          <option value="lock">Lock</option>
          <option value="router">Router</option>
        </select>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-border/50 bg-background">
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-sm">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm">Source IP</th>
                <th className="px-4 py-3 text-left text-sm">Endpoint</th>
                <th className="px-4 py-3 text-left text-sm">Method</th>
                <th className="px-4 py-3 text-left text-sm">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t border-border/30">
                  <td className="px-4 py-2 text-sm font-mono">{new Date(a.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm font-mono">{a.sourceIP}</td>
                  <td className="px-4 py-2 text-sm">{a.endpoint}</td>
                  <td className="px-4 py-2 text-sm">{a.method}</td>
                  <td className="px-4 py-2 text-sm">{severity(a)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-secondary" colSpan={5}>No attacks yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Alerts;


