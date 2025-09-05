import { Attack, DeviceInfo, Settings } from './types';

export const MAX_ATTACKS = 1000;
export const attacks: Attack[] = [];

export const devices: DeviceInfo[] = [
  { id: 'cam-001', name: 'Security Camera #1', type: 'camera', status: 'online', attacks: 0, ip: '192.168.1.101', location: 'Front Entrance', lastSeen: new Date().toISOString(), firmware: '2.1.4', uptime: '7d 14h' },
  { id: 'router-001', name: 'WiFi Router', type: 'router', status: 'online', attacks: 0, ip: '192.168.1.1', location: 'Server Room', lastSeen: new Date().toISOString(), firmware: '4.2.8', uptime: '30d 12h' },
  { id: 'lock-001', name: 'Smart Lock', type: 'lock', status: 'online', attacks: 0, ip: '192.168.1.104', location: 'Main Door', lastSeen: new Date().toISOString(), firmware: '3.0.1', uptime: '12d 3h' }
];

export const settings: Settings = {
  autoBlock: true,
  threatThreshold: 10,
  websocketEnabled: true,
  retentionDays: 7,
};
