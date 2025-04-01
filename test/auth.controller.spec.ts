import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/controllers/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { LoginDto } from '../src/dtos/login.dto';
import { CreateUserDto } from '../src/dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../src/services/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/schemas/user.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUserModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        user: {
          _id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          personalToken: 'personal-token',
        },
        access_token: 'jwt-token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);
      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        user: {
          _id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          personalToken: 'personal-token',
        },
        access_token: 'jwt-token',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto);
      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile and return the result', async () => {
      const req = {
        user: {
          userId: 'user-id',
          email: 'test@example.com',
          role: 'user',
        },
      };

      const expectedResult = {
        _id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        personalToken: 'personal-token',
      };

      jest.spyOn(authService, 'getProfile').mockResolvedValue(expectedResult);

      const result = await controller.getProfile(req as any);
      expect(result).toEqual(expectedResult);
      expect(authService.getProfile).toHaveBeenCalledWith(req.user);
    });
  });
}); 