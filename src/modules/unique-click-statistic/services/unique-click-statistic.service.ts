import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { 
  UniqueClickStatistic, 
  UniqueClickStatisticDocument 
} from '../schemas/unique-click-statistic.schema';
import { CreateUniqueClickStatisticDto } from '../dtos/create-unique-click-statistic.dto';
import { UpdateUniqueClickStatisticDto } from '../dtos/update-unique-click-statistic.dto';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class UniqueClickStatisticService {
  constructor(
    @InjectModel(UniqueClickStatistic.name) 
    private uniqueClickStatisticModel: Model<UniqueClickStatisticDocument>,
    
    private userService: UserService,
  ) {}

  async create(createDto: CreateUniqueClickStatisticDto, userId: string): Promise<UniqueClickStatisticDocument> {
    // Validate that the personal token is valid for this user
    await this.userService.validatePersonalToken(userId, createDto.personalToken);
    
    // Check if a unique statistic with this text and user already exists
    const existingStatistic = await this.uniqueClickStatisticModel.findOne({
      text: createDto.text,
      userId
    }).exec();
    
    if (existingStatistic) {
      // If it exists, update count
      existingStatistic.count += 1;
      return existingStatistic.save();
    }
    
    // Create a new unique click statistic
    const newUniqueClickStatistic = new this.uniqueClickStatisticModel({
      text: createDto.text,
      userId,
      count: 1
    });
    
    return newUniqueClickStatistic.save();
  }

  async createWithPersonalToken(text: string, personalToken: string): Promise<UniqueClickStatisticDocument> {
    const user = await this.userService.findByPersonalToken(personalToken);
    
    if (!user) {
      throw new UnauthorizedException('Invalid personal token');
    }
    
    // Check if a unique statistic with this text and user already exists
    const existingStatistic = await this.uniqueClickStatisticModel.findOne({
      text,
      userId: user.id
    }).exec();
    
    if (existingStatistic) {
      // If it exists, update count
      existingStatistic.count += 1;
      return existingStatistic.save();
    }
    
    // Create a new unique click statistic
    const newUniqueClickStatistic = new this.uniqueClickStatisticModel({
      text,
      userId: user.id,
      count: 1
    });
    
    return newUniqueClickStatistic.save();
  }

  async findAll(): Promise<UniqueClickStatisticDocument[]> {
    return this.uniqueClickStatisticModel.find()
      .sort({ count: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<UniqueClickStatisticDocument[]> {
    return this.uniqueClickStatisticModel.find({ userId })
      .sort({ count: -1 })
      .exec();
  }

  async findOne(id: string): Promise<UniqueClickStatisticDocument> {
    const entry = await this.uniqueClickStatisticModel.findById(id).exec();
    
    if (!entry) {
      throw new NotFoundException(`Unique click statistic with ID ${id} not found`);
    }
    
    return entry;
  }

  async update(id: string, updateDto: UpdateUniqueClickStatisticDto): Promise<UniqueClickStatisticDocument> {
    const updatedEntry = await this.uniqueClickStatisticModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    
    if (!updatedEntry) {
      throw new NotFoundException(`Unique click statistic with ID ${id} not found`);
    }
    
    return updatedEntry;
  }

  async remove(id: string): Promise<void> {
    const result = await this.uniqueClickStatisticModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Unique click statistic with ID ${id} not found`);
    }
  }

  // Get summary of clicks by user
  async getUserClickSummary(userId: string, personalToken: string): Promise<any[]> {
    // Validate that the personal token is valid for this user
    await this.userService.validatePersonalToken(userId, personalToken);
    
    return this.uniqueClickStatisticModel.find({ userId })
      .sort({ count: -1 })
      .exec();
  }
} 