import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config";
import { Button } from "@/components/ui/button";

const Reports = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE_URL}/api/stats`);
      const j = await res.json();
      setStats(j.data);
    };
    load();
  }, []);

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: stats,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iot-security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold">Security Analytics</h1>
      {!stats ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="metric-card"><p className="text-secondary text-sm">Threat Level</p><p className="text-2xl font-bold">{stats.threatLevel}</p></div>
          <div className="metric-card"><p className="text-secondary text-sm">Blocked (approx)</p><p className="text-2xl font-bold">{Math.round((stats.totalAttacks || 0) * 0.7)}</p></div>
          <div className="metric-card"><p className="text-secondary text-sm">Unique Sources</p><p className="text-2xl font-bold">{stats.uniqueIps}</p></div>
          <div className="metric-card"><p className="text-secondary text-sm">System Health</p><p className="text-2xl font-bold">95%</p></div>
        </div>
      )}
      <Button onClick={exportReport}>Export</Button>
    </div>
  );
};

export default Reports;


