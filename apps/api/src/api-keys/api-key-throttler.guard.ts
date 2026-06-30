import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

const API_KEY_LIMIT = 200;
const DEFAULT_LIMIT = 100;
const WINDOW_MS = 60_000;

interface Bucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class ApiKeyThrottlerGuard implements CanActivate {
  private buckets = new Map<string, Bucket>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-api-key'] || request.ip || 'anonymous';
    const limit = request.headers['x-api-key'] ? API_KEY_LIMIT : DEFAULT_LIMIT;
    const now = Date.now();

    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + WINDOW_MS };
      this.buckets.set(key, bucket);
    }

    bucket.count++;
    return bucket.count <= limit;
  }
}
