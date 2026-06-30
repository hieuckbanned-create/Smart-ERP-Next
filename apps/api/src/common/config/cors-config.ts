import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEV_ORIGINS = [
  'http://localhost:3457',
  'http://localhost:3467',
  'http://localhost:3456',
  'http://localhost:3001',
  'http://localhost:3000',
];

export function buildCorsOptions(): CorsOptions {
  const configuredOrigins = process.env.CORS_ORIGINS
    ?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  let origin: CorsOptions['origin'];

  if (configuredOrigins?.length) {
    if (configuredOrigins.includes('*') && process.env.NODE_ENV !== 'production') {
      origin = '*';
    } else {
      origin = configuredOrigins.filter((o) => o !== '*');
    }
  } else {
    origin = DEV_ORIGINS;
  }

  return {
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Version', 'Idempotency-Key', 'X-API-Key'],
    maxAge: 86400,
  };
}
