import { Shield, AlertTriangle, Eye, Clock } from "lucide-react";

interface Attack {
  id: string;
  timestamp: string;
  sourceIP: string;
  endpoint: string;
  method: string;
  payload?: string;
  blocked: boolean;
  country?: string;
  city?: string;
}

interface AttackMetricsProps {
  attacks: Attack[];
  totalAttacks: number;
}

export const AttackMetrics = ({ attacks, totalAttacks }: AttackMetricsProps) => {
  const recentAttacks = attacks.length;
  const blockedAttacks = attacks.filter(a => a.blocked).length;
  const uniqueIPs = new Set(attacks.map(a => a.sourceIP)).size;
  const lastAttack = attacks[0]?.timestamp ? new Date(attacks[0].timestamp) : null;
  const lastAttackerIp = attacks[0]?.sourceIP;
  const lastAttackerGeo = [attacks[0]?.city, attacks[0]?.country].filter(Boolean).join(', ');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="metric-card group cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary">Total Attacks</p>
            <p className="text-3xl font-bold text-attack glow-text">{totalAttacks.toLocaleString()}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-xs text-secondary mt-2">Since deployment</p>
      </div>

      <div className="metric-card group cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary">Blocked</p>
            <p className="text-3xl font-bold text-primary glow-text">{blockedAttacks}</p>
          </div>
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <p className="text-xs text-secondary mt-2">Recent attacks blocked</p>
      </div>

      <div className="metric-card group cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary">Unique IPs</p>
            <p className="text-3xl font-bold text-honeypot glow-text">{uniqueIPs}</p>
          </div>
          <Eye className="w-8 h-8 text-primary" />
        </div>
        <p className="text-xs text-secondary mt-2">Different attackers</p>
      </div>

      <div className="metric-card group cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary">Last Attack</p>
            <p className="text-lg font-bold text-foreground">
              {lastAttack ? (
                <span>{Math.floor((Date.now() - lastAttack.getTime()) / 1000)}s ago</span>
              ) : (
                "No attacks"
              )}
            </p>
            {lastAttackerIp && (
              <p className="text-xs text-secondary font-mono">IP: {lastAttackerIp}{lastAttackerGeo ? ` • ${lastAttackerGeo}` : ''}</p>
            )}
          </div>
          <Clock className="w-8 h-8 text-secondary" />
        </div>
        <p className="text-xs text-secondary mt-2">Most recent activity</p>
      </div>
    </div>
  );
};