import { Request, Response } from 'express';

export interface Attack {
  id: string;
  timestamp: Date;
  sourceIP: string;
  endpoint: string;
  method: string;
  payload?: string;
  blocked: boolean;
  country?: string;
  city?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export type AsyncRequestHandler = (
  req: Request,
  res: Response
) => Promise<void>;

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'camera' | 'lock' | 'router' | 'thermostat' | 'plug';
  status: 'online' | 'offline';
  attacks: number;
  ip: string;
  location: string;
  lastSeen: string;
  firmware?: string;
  uptime?: string;
  image?: string;
}

export interface Settings {
  autoBlock: boolean;
  threatThreshold: number;
  websocketEnabled: boolean;
  retentionDays: number;
}
