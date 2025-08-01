import { Request } from 'express';

export function getIp(req: Request): string {
  return req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '';
}