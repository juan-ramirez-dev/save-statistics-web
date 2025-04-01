import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClickStatisticService } from './click-statistic.service';
import { ClickStatistic, ClickStatisticDocument } from '../schemas/click-statistic.schema';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';

const mockClickStatistic = {
  _id: 'some-id',
  text: 'btn_login',
  userId: 'user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockClickStatisticDocument = {
  ...mockClickStatistic,
  save: jest.fn().mockResolvedValue(mockClickStatistic),
} as unknown as ClickStatisticDocument;

describe('ClickStatisticService', () => {
  let service: ClickStatisticService;
  let model: Model<ClickStatisticDocument>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClickStatisticService,
        {
          provide: getModelToken(ClickStatistic.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockClickStatisticDocument),
            constructor: jest.fn().mockResolvedValue(mockClickStatisticDocument),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            aggregate: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            validatePersonalToken: jest.fn(),
            findByPersonalToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClickStatisticService>(ClickStatisticService);
    model = module.get<Model<ClickStatisticDocument>>(getModelToken(ClickStatistic.name));
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a click statistic when token is valid', async () => {
      const createDto = { text: 'btn_login', personalToken: 'valid-token' };
      const userId = 'user-id';

      // Mock validación del token
      jest.spyOn(userService, 'validatePersonalToken').mockResolvedValue(true);

      // Mock constructor
      jest.spyOn(model.prototype, 'save').mockResolvedValueOnce({
        ...mockClickStatisticDocument,
        text: createDto.text,
        userId,
      } as any);

      const result = await service.create(createDto, userId);
      expect(result.text).toEqual(createDto.text);
      expect(result.userId).toEqual(userId);
      expect(userService.validatePersonalToken).toHaveBeenCalledWith(userId, createDto.personalToken);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const createDto = { text: 'btn_login', personalToken: 'invalid-token' };
      const userId = 'user-id';

      // Mock validación del token que falla
      jest.spyOn(userService, 'validatePersonalToken').mockRejectedValue(
        new UnauthorizedException('Token personal no válido para este usuario')
      );

      await expect(service.create(createDto, userId)).rejects.toThrow(UnauthorizedException);
      expect(userService.validatePersonalToken).toHaveBeenCalledWith(userId, createDto.personalToken);
    });
  });

  describe('createWithPersonalToken', () => {
    it('should create and return a click statistic when UUID is valid', async () => {
      const text = 'btn_login';
      const uuid = 'valid-token-123';
      const mockUser = { id: 'user-id', personalToken: uuid };

      // Mock búsqueda por token personal
      jest.spyOn(userService, 'findByPersonalToken').mockResolvedValue(mockUser as any);

      // Mock constructor
      jest.spyOn(model.prototype, 'save').mockResolvedValueOnce({
        ...mockClickStatisticDocument,
        text,
        userId: mockUser.id,
      } as any);

      const result = await service.createWithPersonalToken(text, uuid);
      expect(result.text).toEqual(text);
      expect(result.userId).toEqual(mockUser.id);
      expect(userService.findByPersonalToken).toHaveBeenCalledWith(uuid);
    });

    it('should throw UnauthorizedException when UUID is invalid', async () => {
      const text = 'btn_login';
      const uuid = 'invalid-token';

      // Mock búsqueda por token personal que falla
      jest.spyOn(userService, 'findByPersonalToken').mockResolvedValue(null);

      await expect(service.createWithPersonalToken(text, uuid)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByPersonalToken).toHaveBeenCalledWith(uuid);
    });
  });

  describe('findAll', () => {
    it('should return an array of click statistics', async () => {
      const mockClickStatistics = [mockClickStatistic];
      jest.spyOn(model, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockClickStatistics),
        }),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual(mockClickStatistics);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return click statistics for a specific user', async () => {
      const userId = 'user-id';
      const mockClickStatistics = [mockClickStatistic];
      jest.spyOn(model, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockClickStatistics),
        }),
      } as any);

      const result = await service.findByUser(userId);
      expect(result).toEqual(mockClickStatistics);
      expect(model.find).toHaveBeenCalledWith({ userId });
    });
  });

  describe('findOne', () => {
    it('should return a single click statistic', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClickStatistic),
      } as any);

      const result = await service.findOne('some-id');
      expect(result).toEqual(mockClickStatistic);
      expect(model.findById).toHaveBeenCalledWith('some-id');
    });

    it('should throw NotFoundException if click statistic is not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a click statistic and return undefined', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClickStatistic),
      } as any);

      await expect(service.remove('some-id')).resolves.toBeUndefined();
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('some-id');
    });

    it('should throw NotFoundException if click statistic to delete is not found', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getClickSummary', () => {
    it('should return click summary data', async () => {
      const mockSummary = [{
        _id: 'btn_login',
        count: 5,
        firstClick: new Date(),
        lastClick: new Date()
      }];
      
      jest.spyOn(model, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockSummary),
      } as any);

      const result = await service.getClickSummary();
      expect(result).toEqual(mockSummary);
      expect(model.aggregate).toHaveBeenCalled();
    });
  });

  describe('getUserClickSummary', () => {
    it('should return click summary data for a specific user when token is valid', async () => {
      const userId = 'user-id';
      const personalToken = 'valid-token';
      const mockSummary = [{
        _id: 'btn_login',
        count: 3,
        firstClick: new Date(),
        lastClick: new Date()
      }];
      
      // Mock validación del token
      jest.spyOn(userService, 'validatePersonalToken').mockResolvedValue(true);
      
      jest.spyOn(model, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockSummary),
      } as any);

      const result = await service.getUserClickSummary(userId, personalToken);
      expect(result).toEqual(mockSummary);
      expect(userService.validatePersonalToken).toHaveBeenCalledWith(userId, personalToken);
      expect(model.aggregate).toHaveBeenCalled();
      // Verificamos que el primer paso del pipeline contiene el match con userId
      expect(model.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: { userId }
          })
        ])
      );
    });

    it('should throw UnauthorizedException when token is invalid for user summary', async () => {
      const userId = 'user-id';
      const personalToken = 'invalid-token';
      
      // Mock validación del token que falla
      jest.spyOn(userService, 'validatePersonalToken').mockRejectedValue(
        new UnauthorizedException('Token personal no válido para este usuario')
      );

      await expect(service.getUserClickSummary(userId, personalToken)).rejects.toThrow(UnauthorizedException);
      expect(userService.validatePersonalToken).toHaveBeenCalledWith(userId, personalToken);
    });
  });
}); 