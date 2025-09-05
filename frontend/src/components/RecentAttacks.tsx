import { Shield, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface RecentAttacksProps {
  attacks: Attack[];
}

export const RecentAttacks = ({ attacks }: RecentAttacksProps) => {
  const recentAttacks = attacks.slice(0, 10);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getEndpointIcon = (endpoint: string) => {
    if (endpoint.includes("camera")) return "📹";
    if (endpoint.includes("lock")) return "🔒";
    if (endpoint.includes("router")) return "📡";
    return "🔗";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500/20 text-blue-300";
      case "POST": return "bg-green-500/20 text-green-300";
      case "PUT": return "bg-yellow-500/20 text-yellow-300";
      case "DELETE": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Recent Attacks
      </h3>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {recentAttacks.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p>No recent attacks detected</p>
          </div>
        ) : (
          recentAttacks.map((attack, index) => (
            <div
              key={attack.id}
              className={`p-3 rounded-lg border border-border/50 bg-background/30 transition-all hover:bg-background/50 ${
                index === 0 ? "attack-row" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEndpointIcon(attack.endpoint)}</span>
                  <span className="font-medium text-sm">{attack.endpoint}</span>
                  <Badge className={`text-xs ${getMethodColor(attack.method)}`}>
                    {attack.method}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {attack.blocked ? (
                    <div title="Blocked"><Shield className="w-4 h-4 text-primary" /></div>
                  ) : (
                    <div title="Allowed"><AlertTriangle className="w-4 h-4 text-destructive" /></div>
                  )}
                  <span className="text-xs text-secondary">{formatTime(attack.timestamp)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Source: <span className="text-foreground font-mono">{attack.sourceIP}</span></span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  attack.blocked 
                    ? "bg-primary/20 text-primary" 
                    : "bg-destructive/20 text-destructive"
                }`}>
                  {attack.blocked ? "BLOCKED" : "ALLOWED"}
                </span>
              </div>
              
              {attack.payload && (
                <div className="mt-2 p-2 bg-background/50 rounded text-xs font-mono text-secondary truncate">
                  {attack.payload}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {recentAttacks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-secondary text-center">
            Showing {recentAttacks.length} most recent attacks
          </p>
        </div>
      )}
    </div>
  );
};