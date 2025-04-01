import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UniqueClickStatisticService } from './unique-click-statistic.service';
import { UserService } from './user.service';
import { UniqueClickStatistic, UniqueClickStatisticDocument } from '../schemas/unique-click-statistic.schema';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

// Mock implementation
const mockUniqueClickStatisticModel = () => ({
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  new: jest.fn(),
});

const mockUserService = () => ({
  validatePersonalToken: jest.fn(),
  findByPersonalToken: jest.fn(),
});

describe('UniqueClickStatisticService', () => {
  let service: UniqueClickStatisticService;
  let uniqueClickStatisticModel: Model<UniqueClickStatisticDocument>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniqueClickStatisticService,
        {
          provide: getModelToken(UniqueClickStatistic.name),
          useFactory: mockUniqueClickStatisticModel,
        },
        {
          provide: UserService,
          useFactory: mockUserService,
        },
      ],
    }).compile();

    service = module.get<UniqueClickStatisticService>(UniqueClickStatisticService);
    uniqueClickStatisticModel = module.get<Model<UniqueClickStatisticDocument>>(
      getModelToken(UniqueClickStatistic.name),
    );
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new unique click statistic if one does not exist', async () => {
      // Arrange
      const createDto = {
        text: 'test-text',
        personalToken: 'valid-token',
      };
      const userId = 'user-id';

      const mockExistingStatistic = null;
      jest.spyOn(uniqueClickStatisticModel, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockExistingStatistic),
      } as any);

      const mockSaveResult = {
        id: 'unique-stat-id',
        text: 'test-text',
        userId,
        count: 1,
      };
      jest.spyOn(uniqueClickStatisticModel.prototype, 'save').mockResolvedValueOnce(mockSaveResult as any);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(userService.validatePersonalToken).toHaveBeenCalledWith(userId, createDto.personalToken);
      expect(uniqueClickStatisticModel.findOne).toHaveBeenCalledWith({
        text: createDto.text,
        userId,
      });
      expect(result).toEqual(mockSaveResult);
    });

    it('should update an existing unique click statistic if one exists', async () => {
      // Arrange
      const createDto = {
        text: 'test-text',
        personalToken: 'valid-token',
      };
      const userId = 'user-id';

      const mockExistingStatistic = {
        text: 'test-text',
        userId,
        count: 1,
        save: jest.fn().mockResolvedValueOnce({
          id: 'unique-stat-id',
          text: 'test-text',
          userId,
          count: 2,
        }),
      };

      jest.spyOn(uniqueClickStatisticModel, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockExistingStatistic),
      } as any);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(userService.validatePersonalToken).toHaveBeenCalledWith(userId, createDto.personalToken);
      expect(uniqueClickStatisticModel.findOne).toHaveBeenCalledWith({
        text: createDto.text,
        userId,
      });
      expect(mockExistingStatistic.count).toBe(2);
      expect(mockExistingStatistic.save).toHaveBeenCalled();
    });
  });

  describe('createWithPersonalToken', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      // Arrange
      const text = 'test-text';
      const invalidToken = 'invalid-token';
      
      jest.spyOn(userService, 'findByPersonalToken').mockResolvedValueOnce(null);
      
      // Act & Assert
      await expect(service.createWithPersonalToken(text, invalidToken)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByPersonalToken).toHaveBeenCalledWith(invalidToken);
    });
    
    it('should create a new unique click statistic with valid token', async () => {
      // Arrange
      const text = 'test-text';
      const validToken = 'valid-token';
      const user = { id: 'user-id', personalToken: validToken };
      
      jest.spyOn(userService, 'findByPersonalToken').mockResolvedValueOnce(user as any);
      
      const mockExistingStatistic = null;
      jest.spyOn(uniqueClickStatisticModel, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockExistingStatistic),
      } as any);
      
      const mockSaveResult = {
        id: 'unique-stat-id',
        text,
        userId: user.id,
        count: 1,
      };
      
      jest.spyOn(uniqueClickStatisticModel.prototype, 'save').mockResolvedValueOnce(mockSaveResult as any);
      
      // Act
      const result = await service.createWithPersonalToken(text, validToken);
      
      // Assert
      expect(userService.findByPersonalToken).toHaveBeenCalledWith(validToken);
      expect(uniqueClickStatisticModel.findOne).toHaveBeenCalledWith({
        text,
        userId: user.id,
      });
      expect(result).toEqual(mockSaveResult);
    });
  });

  describe('findOne', () => {
    it('should return a unique click statistic if found', async () => {
      // Arrange
      const id = 'unique-stat-id';
      const mockStatistic = { id, text: 'test' };
      
      jest.spyOn(uniqueClickStatisticModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockStatistic),
      } as any);
      
      // Act
      const result = await service.findOne(id);
      
      // Assert
      expect(uniqueClickStatisticModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockStatistic);
    });
    
    it('should throw NotFoundException if statistic not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      
      jest.spyOn(uniqueClickStatisticModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);
      
      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  // More tests can be added for other methods...
});