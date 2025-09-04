import { useState } from "react";
import { Search, Filter, Download, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Attack {
  id: string;
  timestamp: Date;
  sourceIP: string;
  endpoint: string;
  method: string;
  payload?: string;
  blocked: boolean;
}

interface AttackLogsProps {
  attacks: Attack[];
}

export const AttackLogs = ({ attacks }: AttackLogsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filteredAttacks = attacks.filter(attack => {
    const matchesSearch = 
      attack.sourceIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attack.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attack.payload && attack.payload.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMethod = filterMethod === "ALL" || attack.method === filterMethod;
    const matchesStatus = 
      filterStatus === "ALL" || 
      (filterStatus === "BLOCKED" && attack.blocked) ||
      (filterStatus === "ALLOWED" && !attack.blocked);

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "POST": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "PUT": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "DELETE": return "bg-red-500/20 text-red-300 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attack Logs</h1>
          <p className="text-secondary">Detailed view of all honeypot interactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="metric-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by IP, endpoint, or payload..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 bg-input border border-border rounded-md text-sm"
            >
              <option value="ALL">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-input border border-border rounded-md text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="BLOCKED">Blocked</option>
              <option value="ALLOWED">Allowed</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm text-secondary">
          <span>Showing {filteredAttacks.length} of {attacks.length} attacks</span>
          <div className="flex gap-2">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Blocked: {attacks.filter(a => a.blocked).length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              Allowed: {attacks.filter(a => !a.blocked).length}
            </span>
          </div>
        </div>
      </div>

      {/* Attacks Table */}
      <div className="metric-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 text-left">
                <th className="pb-3 text-sm font-medium text-secondary">Timestamp</th>
                <th className="pb-3 text-sm font-medium text-secondary">Source IP</th>
                <th className="pb-3 text-sm font-medium text-secondary">Endpoint</th>
                <th className="pb-3 text-sm font-medium text-secondary">Method</th>
                <th className="pb-3 text-sm font-medium text-secondary">Status</th>
                <th className="pb-3 text-sm font-medium text-secondary">Payload</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttacks.map((attack, index) => (
                <tr 
                  key={attack.id} 
                  className={`border-b border-border/30 hover:bg-background/50 transition-colors ${
                    index < 3 ? "attack-row" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="py-3 text-sm font-mono text-foreground">
                    {formatTimestamp(attack.timestamp)}
                  </td>
                  <td className="py-3 text-sm font-mono text-foreground">
                    {attack.sourceIP}
                  </td>
                  <td className="py-3 text-sm text-foreground">
                    <span className="font-medium">{attack.endpoint}</span>
                  </td>
                  <td className="py-3">
                    <Badge className={`${getMethodColor(attack.method)} border`}>
                      {attack.method}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge 
                      className={`${
                        attack.blocked 
                          ? "bg-primary/20 text-primary border-primary/30" 
                          : "bg-destructive/20 text-destructive border-destructive/30"
                      } border`}
                    >
                      {attack.blocked ? "BLOCKED" : "ALLOWED"}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm">
                    {attack.payload ? (
                      <div className="max-w-xs">
                        <code className="text-xs font-mono text-secondary bg-background/50 px-2 py-1 rounded truncate block">
                          {attack.payload}
                        </code>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAttacks.length === 0 && (
            <div className="text-center py-12 text-secondary">
              <Filter className="w-8 h-8 mx-auto mb-2" />
              <p>No attacks match your current filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};