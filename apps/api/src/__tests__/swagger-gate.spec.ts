jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn(),
  })),
  SwaggerModule: {
    createDocument: jest.fn(() => ({})),
    setup: jest.fn(),
  },
}));

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

import { setupSwagger } from '../swagger-setup';

describe('Swagger production gate', () => {
  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
    jest.clearAllMocks();
  });

  it('does not set up Swagger when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';

    const { SwaggerModule } = require('@nestjs/swagger');
    const app = { /* minimal mock Nest app */ get: jest.fn() } as any;

    setupSwagger(app, '1.0.0');

    expect(SwaggerModule.setup).not.toHaveBeenCalled();
  });

  it('sets up Swagger when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';

    const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
    const app = { get: jest.fn() } as any;

    setupSwagger(app, '1.0.0');

    expect(SwaggerModule.setup).toHaveBeenCalledWith('api', app, {});
    expect(DocumentBuilder).toHaveBeenCalled();
  });

  it('sets up Swagger when NODE_ENV is unset', () => {
    delete process.env.NODE_ENV;

    const { SwaggerModule } = require('@nestjs/swagger');
    const app = { get: jest.fn() } as any;

    setupSwagger(app, '1.0.0');

    expect(SwaggerModule.setup).toHaveBeenCalled();
  });
});
