import { Request, Response } from 'express';

export interface Attack {
  id: string;
  timestamp: Date;
  sourceIP: string;
  endpoint: string;
  method: string;
  payload?: string;
  blocked: boolean;
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
