import { Test, TestingModule } from '@nestjs/testing';
import { UniqueClickStatisticController } from './unique-click-statistic.controller';
import { UniqueClickStatisticService } from '../services/unique-click-statistic.service';
import { UnauthorizedException } from '@nestjs/common';

describe('UniqueClickStatisticController', () => {
  let controller: UniqueClickStatisticController;
  let service: UniqueClickStatisticService;

  const mockUniqueClickStatisticService = () => ({
    create: jest.fn(),
    createWithPersonalToken: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getUserClickSummary: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UniqueClickStatisticController],
      providers: [
        {
          provide: UniqueClickStatisticService,
          useFactory: mockUniqueClickStatisticService,
        },
      ],
    }).compile();

    controller = module.get<UniqueClickStatisticController>(UniqueClickStatisticController);
    service = module.get<UniqueClickStatisticService>(UniqueClickStatisticService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct parameters', async () => {
      // Arrange
      const createDto = { text: 'test-text', personalToken: 'valid-token' };
      const mockRequest = { user: { userId: 'user-id' } };
      const expectedResult = { id: 'unique-stat-id', text: 'test-text', count: 1 };
      
      jest.spyOn(service, 'create').mockResolvedValueOnce(expectedResult as any);
      
      // Act
      const result = await controller.create(createDto, mockRequest);
      
      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto, mockRequest.user.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createSimple', () => {
    it('should call service.createWithPersonalToken with correct parameters', async () => {
      // Arrange
      const simpleDto = { text: 'test-text', uuid: 'valid-uuid' };
      const expectedResult = { id: 'unique-stat-id', text: 'test-text', count: 1 };
      
      jest.spyOn(service, 'createWithPersonalToken').mockResolvedValueOnce(expectedResult as any);
      
      // Act
      const result = await controller.createSimple(simpleDto);
      
      // Assert
      expect(service.createWithPersonalToken).toHaveBeenCalledWith(simpleDto.text, simpleDto.uuid);
      expect(result).toEqual(expectedResult);
    });
    
    it('should handle UnauthorizedException from service', async () => {
      // Arrange
      const simpleDto = { text: 'test-text', uuid: 'invalid-uuid' };
      
      jest.spyOn(service, 'createWithPersonalToken').mockRejectedValueOnce(
        new UnauthorizedException('Invalid personal token')
      );
      
      // Act & Assert
      await expect(controller.createSimple(simpleDto)).rejects.toThrow(UnauthorizedException);
      expect(service.createWithPersonalToken).toHaveBeenCalledWith(simpleDto.text, simpleDto.uuid);
    });
  });

  describe('findAll', () => {
    it('should return all unique click statistics', async () => {
      // Arrange
      const expectedResult = [
        { id: 'stat-1', text: 'test-1', count: 5 },
        { id: 'stat-2', text: 'test-2', count: 3 },
      ];
      
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(expectedResult as any);
      
      // Act
      const result = await controller.findAll();
      
      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findMyClicks', () => {
    it('should return user-specific statistics', async () => {
      // Arrange
      const mockRequest = { user: { userId: 'user-id' } };
      const expectedResult = [
        { id: 'stat-1', text: 'test-1', userId: 'user-id', count: 5 },
      ];
      
      jest.spyOn(service, 'findByUser').mockResolvedValueOnce(expectedResult as any);
      
      // Act
      const result = await controller.findMyClicks(mockRequest);
      
      // Assert
      expect(service.findByUser).toHaveBeenCalledWith(mockRequest.user.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single click statistic', async () => {
      // Arrange
      const id = 'stat-id';
      const expectedResult = { id, text: 'test', count: 5 };
      
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(expectedResult as any);
      
      // Act
      const result = await controller.findOne(id);
      
      // Assert
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a click statistic', async () => {
      // Arrange
      const id = 'stat-id';
      const updateDto = { count: 10 };
      const expectedResult = { id, text: 'test', count: 10 };
      
      jest.spyOn(service, 'update').mockResolvedValueOnce(expectedResult as any);
      
      // Act
      const result = await controller.update(id, updateDto);
      
      // Assert
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a click statistic', async () => {
      // Arrange
      const id = 'stat-id';
      
      jest.spyOn(service, 'remove').mockResolvedValueOnce(undefined);
      
      // Act
      await controller.remove(id);
      
      // Assert
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  // More tests for other endpoints...
}); 