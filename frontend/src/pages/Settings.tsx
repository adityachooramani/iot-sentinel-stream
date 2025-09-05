import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Settings = {
  autoBlock: boolean;
  threatThreshold: number;
  websocketEnabled: boolean;
  retentionDays: number;
};

const Settings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`).then(r => r.json()).then(j => setSettings(j.data));
  }, []);

  const update = (patch: Partial<Settings>) => setSettings(s => (s ? { ...s, ...patch } : s));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <div className="flex-1 p-6">Loading...</div>;
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Protection</h3>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Auto-block attackers</p>
              <p className="text-secondary text-sm">Automatically block high-risk hits</p>
            </div>
            <Switch checked={settings.autoBlock} onCheckedChange={(v) => update({ autoBlock: v })} />
          </div>
          <div className="py-2">
            <p className="font-medium mb-1">Threat threshold</p>
            <Input type="number" value={settings.threatThreshold}
              onChange={(e) => update({ threatThreshold: Number(e.target.value) })} />
          </div>
        </div>

        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Realtime & Retention</h3>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">WebSocket updates</p>
              <p className="text-secondary text-sm">Enable live updates across pages</p>
            </div>
            <Switch checked={settings.websocketEnabled} onCheckedChange={(v) => update({ websocketEnabled: v })} />
          </div>
          <div className="py-2">
            <p className="font-medium mb-1">Data retention (days)</p>
            <Input type="number" value={settings.retentionDays}
              onChange={(e) => update({ retentionDays: Number(e.target.value) })} />
          </div>
        </div>
      </div>

      <div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
      </div>
    </div>
  );
};

export default Settings;


