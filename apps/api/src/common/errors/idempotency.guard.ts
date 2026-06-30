import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

interface IdempotencyRecord {
  statusCode: number;
  body: any;
}

@Injectable()
export class IdempotencyGuard implements CanActivate {
  private store = new Map<string, IdempotencyRecord>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.method !== 'POST' && request.method !== 'PATCH') {
      return true;
    }

    const key = request.headers['idempotency-key'];
    if (!key) return true;

    const existing = this.store.get(key);
    if (existing) {
      throw new HttpException(
        { success: false, data: null, error: ErrorCode.IDEMPOTENCY_REPLAY },
        HttpStatus.CONFLICT,
      );
    }

    this.store.set(key, { statusCode: 0, body: null });
    const originalJson = response.json.bind(response);
    response.json = (body: any) => {
      this.store.set(key, { statusCode: response.statusCode, body });
      originalJson(body);
    };

    return true;
  }
}
