import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard, Throttle } from '@nestjs/throttler';
const request = require('supertest');

@Controller('test')
class TestController {
  @Post('rate-limit')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  testEndpoint() {
    return { success: true };
  }
}

describe('Rate limiting', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ name: 'short', ttl: 60000, limit: 5 }]),
      ],
      controllers: [TestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows up to 5 requests and blocks the 6th with 429', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/test/rate-limit')
        .expect(201);
      expect(res.body).toEqual({ success: true });
    }

    const blocked = await request(app.getHttpServer())
      .post('/test/rate-limit')
      .expect(429);

    expect(blocked.body).toHaveProperty('message');
    expect(blocked.body.statusCode).toBe(429);
  });
});
