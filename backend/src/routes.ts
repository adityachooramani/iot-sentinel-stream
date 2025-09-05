import { Router, Request, Response } from "express";
import { attacks, MAX_ATTACKS, devices, settings } from "./db";
import { getIo } from "./socket";
import { Attack, AttackResponse, AsyncRequestHandler, ApiResponse } from "./types";
import { randomUUID } from "crypto";

const router = Router();

const asyncHandler = (fn: AsyncRequestHandler) => 
  async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error('Route error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

const validatePayload = (body: unknown): string | undefined => {
  if (!body || typeof body !== 'object') return undefined;
  try {
    const str = JSON.stringify(body);
    return str === '{}' ? undefined : str;
  } catch {
    return undefined;
  }
};

const getClientIP = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

const honeypotEndpoints = ["/honeypot/camera", "/honeypot/lock", "/honeypot/router"];

honeypotEndpoints.forEach(endpoint => {
  router.all(endpoint, asyncHandler(async (req: Request, res: Response) => {
    // Lightweight GeoIP enrichment
    const ip = getClientIP(req);
    let country: string | undefined;
    let city: string | undefined;
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 2000);
      const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city` as string, { signal: controller.signal });
      clearTimeout(t);
      if (resp.ok) {
        const data: any = await resp.json();
        if (data && data.status === 'success') {
          country = data.country;
          city = data.city;
        }
      }
    } catch {}
    const attack: Attack = {
      id: randomUUID(),
      timestamp: new Date(),
      sourceIP: ip,
      endpoint,
      method: req.method,
      payload: validatePayload(req.body),
      blocked: Math.random() > 0.2,
      country,
      city,
    };

    attacks.unshift(attack);
    if (attacks.length > MAX_ATTACKS) {
      attacks.length = MAX_ATTACKS;
    }

    // Update device stats when corresponding endpoint is hit
    const deviceMap: Record<string, string> = {
      "/honeypot/camera": "cam-001",
      "/honeypot/lock": "lock-001",
      "/honeypot/router": "router-001",
    };
    const targetId = deviceMap[endpoint];
    const device = devices.find(d => d.id === targetId);
    if (device) {
      device.attacks += 1;
      device.lastSeen = new Date().toISOString();
    }

    // Broadcast new attack over WebSocket
    const io = getIo();
    if (io) {
      io.emit('new_attack', {
        ...attack,
        timestamp: attack.timestamp.toISOString()
      });
    }

    const response: ApiResponse<{ attackId: string }> = {
      message: "Simulated IoT device response",
      data: { attackId: attack.id }
    };

    res.status(200).json(response);
  }));
});

router.get("/api/attacks", asyncHandler(async (_req: Request, res: Response) => {
  const response: ApiResponse<AttackResponse[]> = {
    data: attacks.map(attack => ({
      ...attack,
      timestamp: attack.timestamp.toISOString()
    }))
  };
  res.json(response);
}));

router.get('/api/stats', asyncHandler(async (_req: Request, res: Response) => {
  const totalAttacks = attacks.length;
  const uniqueIps = new Set(attacks.map(a => a.sourceIP)).size;
  const threatLevel = totalAttacks > 30 ? 'High' : totalAttacks > 10 ? 'Medium' : 'Low';
  res.json({ data: { totalAttacks, uniqueIps, threatLevel, serverTime: new Date().toISOString() } });
}));

router.get("/api/attacks/latest", asyncHandler(async (_req: Request, res: Response) => {
  if (attacks.length === 0) {
    res.status(404).json({
      error: "No attacks recorded yet"
    });
    return;
  }
  
  const response: ApiResponse<AttackResponse> = {
    data: {
      ...attacks[0],
      timestamp: attacks[0].timestamp.toISOString()
    }
  };
  res.json(response);
}));

// Devices and Settings endpoints
router.get('/api/devices', asyncHandler(async (_req: Request, res: Response) => {
  res.json({ data: devices });
}));

router.get('/api/settings', asyncHandler(async (_req: Request, res: Response) => {
  res.json({ data: settings });
}));

router.put('/api/settings', asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Partial<typeof settings>;
  Object.assign(settings, body);
  res.json({ data: settings });
}));

// Add new device
router.post('/api/devices', asyncHandler(async (req: Request, res: Response) => {
  const { name, type, ip, location } = req.body as { name: string; type: string; ip: string; location: string };
  if (!name || !type || !ip || !location) {
    res.status(400).json({ error: 'Missing required fields: name, type, ip, location' });
    return;
  }
  
  // Validate device type
  const validTypes = ['camera', 'lock', 'router', 'thermostat', 'plug'] as const;
  if (!validTypes.includes(type as any)) {
    res.status(400).json({ error: `Invalid device type. Must be one of: ${validTypes.join(', ')}` });
    return;
  }
  
  const id = `${type}-${Math.random().toString(36).slice(2, 6)}`;
  const newDevice = {
    id,
    name,
    type: type as 'camera' | 'lock' | 'router' | 'thermostat' | 'plug',
    status: 'online' as const,
    attacks: 0,
    ip,
    location,
    lastSeen: new Date().toISOString(),
    firmware: '1.0.0',
    uptime: '0d 0h'
  };
  devices.push(newDevice);
  res.status(201).json({ data: newDevice });
}));

export default router;
