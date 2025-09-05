// src/api.ts
import { API_BASE_URL } from './config';

export interface Attack {
  id: string;
  timestamp: string;
  sourceIP: string;
  endpoint: string;
  method: string;
  payload?: string;
  blocked: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export async function fetchAttacks(): Promise<Attack[]> {
  const response = await fetch(`${API_BASE_URL}/api/attacks`);
  if (!response.ok) {
    throw new Error('Failed to fetch attacks');
  }
  const json: ApiResponse<Attack[]> = await response.json();
  return json.data || [];
}

export async function fetchLatestAttack(): Promise<Attack | null> {
  const response = await fetch(`${API_BASE_URL}/api/attacks/latest`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch latest attack');
  }
  const json: ApiResponse<Attack> = await response.json();
  return json.data || null;
}
