import { LucideIcon } from "lucide-react";

interface Device {
  id: string;
  name: string;
  icon: LucideIcon;
  status: "online" | "offline";
}

interface DeviceStatusProps {
  devices: Device[];
}

export const DeviceStatus = ({ devices }: DeviceStatusProps) => {
  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary status-online"></div>
        IoT Device Status
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {devices.map((device) => {
          const Icon = device.icon;
          return (
            <div key={device.id} className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="relative">
                <Icon className="w-8 h-8 text-foreground" />
                <div 
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                    device.status === "online" ? "status-online" : "status-offline"
                  }`}
                />
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-foreground">{device.name}</p>
                <p className={`text-sm ${
                  device.status === "online" ? "text-online" : "text-offline"
                }`}>
                  {device.status.toUpperCase()}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-secondary">Honeypot</p>
                <p className="text-xs text-primary">Active</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary">
          ✅ All honeypot devices are online and monitoring for threats
        </p>
      </div>
    </div>
  );
};