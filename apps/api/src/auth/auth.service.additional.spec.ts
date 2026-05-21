import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { I18nService } from '../i18n/i18n.service';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';

jest.mock('bcryptjs');

describe('AuthService - Additional Tests', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let notificationsGateway: NotificationsGateway;
  let i18nService: I18nService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockNotificationsGateway = {
    sendNotification: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    notificationsGateway = module.get<NotificationsGateway>(NotificationsGateway);
    i18nService = module.get<I18nService>(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });

    it('should return user without passwordHash on valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        tenantId: 'tenant-1',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'correct-password');

      expect(result).toBeDefined();
      expect(result.passwordHash).toBeUndefined();
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        tenantId: 'tenant-1',
        role: 'admin',
      };

      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(mockUser);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe('jwt-token');
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should set default role to "user" if not provided', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        tenantId: 'tenant-1',
      };

      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(mockUser);

      expect(result.user.role).toBe('user');
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register('test@example.com', 'password', 'Test User')
      ).rejects.toThrow(ConflictException);
    });

    it('should normalize email before checking existence', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 'new-user' });

      await service.register('TEST@EXAMPLE.COM', 'password', 'Test User');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should create new user with hashed password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUsersService.create.mockResolvedValue({ id: 'new-user' });

      await service.register('test@example.com', 'password', 'Test User', 'tenant-1', 'Company');

      expect(mockUsersService.create).toHaveBeenCalled();
    });
  });
});
