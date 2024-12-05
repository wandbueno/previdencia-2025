import { randomUUID } from 'crypto';

export function generateId(): string {
  return randomUUID();
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function parseJSON<T>(value: string): T {
  try {
    return JSON.parse(value);
  } catch {
    return {} as T;
  }
}

export function stringifyJSON(value: any): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
}