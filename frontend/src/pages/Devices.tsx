import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Device = {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline";
  attacks: number;
  ip: string;
  location: string;
  lastSeen: string;
  firmware?: string;
  uptime?: string;
  image?: string;
};

const Devices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", type: "camera", ip: "", location: "" });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/devices`).then(r => r.json()).then(j => setDevices(j.data || []));
  }, []);

  const filtered = useMemo(() => {
    return devices.filter(d => {
      const statusOk = status === "all" || (status === "attacked" ? d.attacks > 0 : d.status === status);
      const typeOk = type === "all" || d.type === type;
      return statusOk && typeOk;
    });
  }, [devices, status, type]);

  const totals = useMemo(() => {
    const total = devices.length;
    const online = devices.filter(d => d.status === 'online').length;
    const attacked = devices.filter(d => d.attacks > 0).length;
    const health = total ? Math.round((online / total) * 100) : 0;
    return { total, online, attacked, health };
  }, [devices]);

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Device Status</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-green-400 text-sm">All Systems Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card"><p className="text-secondary text-sm">Total Devices</p><p className="text-2xl font-bold">{totals.total}</p></div>
        <div className="metric-card"><p className="text-secondary text-sm">Online Devices</p><p className="text-2xl font-bold">{totals.online}</p></div>
        <div className="metric-card"><p className="text-secondary text-sm">Under Attack</p><p className="text-2xl font-bold">{totals.attacked}</p></div>
        <div className="metric-card"><p className="text-secondary text-sm">Network Health</p><p className="text-2xl font-bold">{totals.health}%</p></div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 rounded-xl bg-[#273a34] text-white text-sm font-medium px-4 pr-8 border-0">
            <option value="all">All Devices</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline Only</option>
            <option value="attacked">Under Attack</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-8 rounded-xl bg-[#273a34] text-white text-sm font-medium px-4 pr-8 border-0">
            <option value="all">All Types</option>
            <option value="camera">Cameras</option>
            <option value="thermostat">Thermostats</option>
            <option value="lock">Smart Locks</option>
            <option value="router">Routers</option>
          </select>
        </div>
        <div>
          <Button onClick={() => setShowAdd(true)}>+ Add Device</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d) => (
          <article key={d.id} className="bg-[#1a2622] rounded-xl border border-border/50 p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${d.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`} />
                <div>
                  <h3 className="text-white font-medium text-base">{d.name}</h3>
                  <p className="text-secondary text-sm capitalize">{d.type}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-secondary">Status:</span><span className="capitalize">{d.status}</span></div>
              <div className="flex justify-between"><span className="text-secondary">Attacks:</span><span className="font-bold">{d.attacks}</span></div>
              <div className="flex justify-between"><span className="text-secondary">Location:</span><span>{d.location}</span></div>
              <div className="flex justify-between"><span className="text-secondary">Uptime:</span><span>{d.uptime || '-'}</span></div>
              <div className="flex justify-between"><span className="text-secondary">IP Address:</span><span className="text-[#0bda49] font-mono">{d.ip}</span></div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="text-secondary">No devices to show</div>}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a2622] rounded-xl border border-border/50 p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-bold mb-4">Add Device</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary mb-1">Name</p>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <p className="text-sm text-secondary mb-1">Type</p>
                <select className="h-9 rounded-md bg-[#273a34] text-white text-sm px-3 border-0 w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="camera">Camera</option>
                  <option value="router">Router</option>
                  <option value="lock">Smart Lock</option>
                  <option value="thermostat">Thermostat</option>
                  <option value="plug">Smart Plug</option>
                </select>
              </div>
              <div>
                <p className="text-sm text-secondary mb-1">IP Address</p>
                <Input value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} />
              </div>
              <div>
                <p className="text-sm text-secondary mb-1">Location</p>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={async () => {
                const res = await fetch(`${API_BASE_URL}/api/devices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
                if (res.ok) {
                  const j = await res.json();
                  setDevices((prev) => [j.data, ...prev]);
                  setShowAdd(false);
                  setForm({ name: "", type: "camera", ip: "", location: "" });
                }
              }}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;


