import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockExpiry?: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly requests = new Map<string, RateLimitEntry>();
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly maxRequests = 100; // per window
  private readonly blockDuration = 15 * 60 * 1000; // 15 minutes block

  // Cleanup old entries every 5 minutes
  private cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime + this.blockDuration) {
        this.requests.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  use(req: Request, res: Response, next: NextFunction) {
    const clientId = this.getClientIdentifier(req);
    const now = Date.now();

    let entry = this.requests.get(clientId);

    // Check if blocked
    if (entry?.blocked) {
      if (entry.blockExpiry && now < entry.blockExpiry) {
        const retryAfter = Math.ceil((entry.blockExpiry - now) / 1000);
        res.setHeader('Retry-After', retryAfter);
        res.setHeader('X-RateLimit-Remaining', '0');
        throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
      }
      // Block expired, reset
      entry = undefined;
    }

    // Initialize or reset window
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + this.windowMs, blocked: false };
    }

    entry.count++;
    this.requests.set(clientId, entry);

    // Set rate limit headers
    const remaining = Math.max(0, this.maxRequests - entry.count);
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    // Check if exceeded
    if (entry.count > this.maxRequests) {
      entry.blocked = true;
      entry.blockExpiry = now + this.blockDuration;
      this.requests.set(clientId, entry);

      const retryAfter = Math.ceil(this.blockDuration / 1000);
      res.setHeader('Retry-After', retryAfter);
      throw new HttpException('Rate limit exceeded. You have been temporarily blocked.', HttpStatus.TOO_MANY_REQUESTS);
    }

    next();
  }

  private getClientIdentifier(req: Request): string {
    // Use API key if available, otherwise IP
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) return `api:${apiKey}`;

    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    return `ip:${ip}`;
  }
}
