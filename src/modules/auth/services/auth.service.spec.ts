import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../services/user.service';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUser = {
    _id: new Types.ObjectId('5f7d7e8c8f3b4b0e8c8f3b4b'),
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    role: 'user',
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
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
    it('should return a user when credentials are valid', async () => {
      // Configurar el mock para findByEmail
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      // Configurar el mock para bcrypt.compare
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');
      
      expect(result).toEqual(mockUser);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
    });
  });

  describe('login', () => {
    it('should return user info and access token when login is successful', async () => {
      // Mock validateUser
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser as any);

      const loginDto = { email: 'test@example.com', password: 'password123' };
      const userId = mockUser._id.toString();

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: {
          id: userId,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
        access_token: 'test-token',
      });

      expect(service.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userId,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return user info and access token', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        ...mockUser,
        _id: new Types.ObjectId('6f7d7e8c8f3b4b0e8c8f3b4c'),
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      };

      // Configurar mocks
      mockUserService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserService.create.mockResolvedValue(createdUser);

      const result = await service.register(createUserDto);
      const userId = createdUser._id.toString();

      expect(result).toEqual({
        user: {
          id: userId,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
        },
        access_token: 'test-token',
      });

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUserService.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userId,
        email: createdUser.email,
        role: createdUser.role,
      });
    });

    it('should throw UnauthorizedException when email is already registered', async () => {
      const createUserDto = {
        name: 'Existing User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock findByEmail para que devuelva un usuario existente
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserService.create).not.toHaveBeenCalled();
    });
  });
}); 