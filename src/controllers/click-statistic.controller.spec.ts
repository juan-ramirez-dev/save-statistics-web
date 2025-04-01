import { Test, TestingModule } from '@nestjs/testing';
import { ClickStatisticController } from './click-statistic.controller';
import { ClickStatisticService } from '../services/click-statistic.service';
import { UnauthorizedException } from '@nestjs/common';

describe('ClickStatisticController', () => {
  let controller: ClickStatisticController;
  let service: ClickStatisticService;

  const mockClickStatistic = {
    _id: 'some-id',
    text: 'btn_login',
    userId: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = { userId: 'user-id' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClickStatisticController],
      providers: [
        {
          provide: ClickStatisticService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUser: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            getClickSummary: jest.fn(),
            getUserClickSummary: jest.fn(),
            createWithPersonalToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClickStatisticController>(ClickStatisticController);
    service = module.get<ClickStatisticService>(ClickStatisticService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a click statistic', async () => {
      const createDto = { text: 'btn_login', personalToken: 'valid-token' };
      const req = { user: mockUser };
      
      jest.spyOn(service, 'create').mockResolvedValue(mockClickStatistic as any);
      
      const result = await controller.create(createDto, req);
      
      expect(result).toEqual(mockClickStatistic);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.userId);
    });
  });

  describe('createSimple', () => {
    it('should create a click statistic with just UUID', async () => {
      const simpleDto = { text: 'btn_login', uuid: 'valid-uuid' };
      
      jest.spyOn(service, 'createWithPersonalToken').mockResolvedValue(mockClickStatistic as any);
      
      const result = await controller.createSimple(simpleDto);
      
      expect(result).toEqual(mockClickStatistic);
      expect(service.createWithPersonalToken).toHaveBeenCalledWith(simpleDto.text, simpleDto.uuid);
    });
  });

  describe('findAll', () => {
    it('should return an array of click statistics', async () => {
      const mockClickStatistics = [mockClickStatistic];
      
      jest.spyOn(service, 'findAll').mockResolvedValue(mockClickStatistics as any);
      
      const result = await controller.findAll();
      
      expect(result).toEqual(mockClickStatistics);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findMyClicks', () => {
    it('should return click statistics for the authenticated user', async () => {
      const mockClickStatistics = [mockClickStatistic];
      const req = { user: mockUser };
      
      jest.spyOn(service, 'findByUser').mockResolvedValue(mockClickStatistics as any);
      
      const result = await controller.findMyClicks(req);
      
      expect(result).toEqual(mockClickStatistics);
      expect(service.findByUser).toHaveBeenCalledWith(mockUser.userId);
    });
  });

  describe('findOne', () => {
    it('should return a single click statistic', async () => {
      const id = 'some-id';
      
      jest.spyOn(service, 'findOne').mockResolvedValue(mockClickStatistic as any);
      
      const result = await controller.findOne(id);
      
      expect(result).toEqual(mockClickStatistic);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('remove', () => {
    it('should remove a click statistic', async () => {
      const id = 'some-id';
      
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);
      
      await controller.remove(id);
      
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
}); 