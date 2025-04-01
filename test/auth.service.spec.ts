import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { UserService } from '../src/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'user',
    personalToken: 'personal-token',
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return user data and access token', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser as any);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);
      
      expect(result).toEqual({
        user: {
          _id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          personalToken: 'personal-token',
        },
        access_token: 'jwt-token',
      });
      
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'test@example.com',
        role: 'user',
      });
    });
  });

  describe('register', () => {
    it('should register a new user and return user data with token', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      mockUserService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(createUserDto);
      
      expect(result).toEqual({
        user: {
          _id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          personalToken: 'personal-token',
        },
        access_token: 'jwt-token',
      });
      
      expect(mockUserService.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
      });
      
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };

      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(user);
      
      expect(result).toEqual({
        _id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        personalToken: 'personal-token',
      });
      
      expect(mockUserService.findOne).toHaveBeenCalledWith('user-id');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const user = {
        userId: 'non-existent-id',
        email: 'test@example.com',
        role: 'user',
      };

      mockUserService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.getProfile(user)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
}); 