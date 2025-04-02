import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from './user.service';
import { User, UserDocument } from '../schemas/user.schema';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';

const mockUser = {
  _id: 'user-id',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  isActive: true,
  role: 'user',
  personalToken: 'valid-token-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserDocument = {
  ...mockUser,
  save: jest.fn().mockResolvedValue(mockUser),
} as unknown as UserDocument;

describe('UserService', () => {
  let service: UserService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUserDocument),
            constructor: jest.fn().mockResolvedValue(mockUserDocument),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUsers),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findOne('user-id');
      expect(result).toEqual(mockUser);
      expect(model.findById).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user with the specified email', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null if no user with the specified email is found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findByPersonalToken', () => {
    it('should return a user with the specified personal token', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findByPersonalToken('valid-token-123');
      expect(result).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ personalToken: 'valid-token-123' });
    });

    it('should return null if no user with the specified personal token is found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await service.findByPersonalToken('nonexistent-token');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      jest.spyOn(model.prototype, 'save').mockResolvedValueOnce({
        ...mockUser,
        name: createUserDto.name,
        email: createUserDto.email,
      } as any);

      const result = await service.create(createUserDto);
      expect(result.name).toEqual(createUserDto.name);
      expect(result.email).toEqual(createUserDto.email);
    });
  });

  describe('update', () => {
    it('should update and return a user', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedUser),
      } as any);

      const result = await service.update('user-id', updateData);
      expect(result).toEqual(updatedUser);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith('user-id', updateData, { new: true });
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.update('non-existent-id', { name: 'Updated Name' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user and return undefined', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      await expect(service.remove('user-id')).resolves.toBeUndefined();
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException if user to delete is not found', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePersonalToken', () => {
    it('should return true when token is valid', async () => {
      const userId = 'user-id';
      const personalToken = 'valid-token-123';

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      await expect(service.validatePersonalToken(userId, personalToken)).resolves.toBe(true);
      expect(model.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = 'non-existent-id';
      const personalToken = 'valid-token-123';

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.validatePersonalToken(userId, personalToken)).rejects.toThrow(NotFoundException);
      expect(model.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const userId = 'user-id';
      const personalToken = 'invalid-token';
      
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      await expect(service.validatePersonalToken(userId, personalToken)).rejects.toThrow(UnauthorizedException);
      expect(model.findById).toHaveBeenCalledWith(userId);
    });
  });
}); 