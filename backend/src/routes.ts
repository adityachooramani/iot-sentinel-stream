import { Router, Request, Response } from "express";
import { attacks, MAX_ATTACKS } from "./db";
import { Attack, AsyncRequestHandler, ApiResponse } from "./types";
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
    const attack: Attack = {
      id: randomUUID(),
      timestamp: new Date(),
      sourceIP: getClientIP(req),
      endpoint,
      method: req.method,
      payload: validatePayload(req.body),
      blocked: Math.random() > 0.2,
    };

    attacks.unshift(attack);
    if (attacks.length > MAX_ATTACKS) {
      attacks.length = MAX_ATTACKS;
    }

    const response: ApiResponse<{ attackId: string }> = {
      message: "Simulated IoT device response",
      data: { attackId: attack.id }
    };

    res.status(200).json(response);
  }));
});

router.get("/api/attacks", asyncHandler(async (_req: Request, res: Response) => {
  const response: ApiResponse<Attack[]> = {
    data: attacks.map(attack => ({
      ...attack,
      timestamp: attack.timestamp
    }))
  };
  res.json(response);
}));

router.get("/api/attacks/latest", asyncHandler(async (_req: Request, res: Response) => {
  if (attacks.length === 0) {
    res.status(404).json({
      error: "No attacks recorded yet"
    });
    return;
  }
  
  const response: ApiResponse<Attack> = {
    data: {
      ...attacks[0],
      timestamp: attacks[0].timestamp
    }
  };
  res.json(response);
}));

export default router;
