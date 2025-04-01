import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClickStatistic, ClickStatisticDocument } from '../schemas/click-statistic.schema';
import { CreateClickStatisticDto } from '../dtos/create-click-statistic.dto';

@Injectable()
export class ClickStatisticService {
  constructor(
    @InjectModel(ClickStatistic.name) private clickStatisticModel: Model<ClickStatisticDocument>,
  ) {}

  async create(createClickStatisticDto: CreateClickStatisticDto, userId: string): Promise<ClickStatisticDocument> {
    // Crear el registro de estadística de clic
    const newClickStatistic = new this.clickStatisticModel({
      text: createClickStatisticDto.text,
      userId,
    });

    // Guardar el registro
    return newClickStatistic.save();
  }

  async findAll(): Promise<ClickStatisticDocument[]> {
    return this.clickStatisticModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByUser(userId: string): Promise<ClickStatisticDocument[]> {
    return this.clickStatisticModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ClickStatisticDocument> {
    const entry = await this.clickStatisticModel.findById(id).exec();
    
    if (!entry) {
      throw new NotFoundException(`Estadística de clic con ID ${id} no encontrada`);
    }
    
    return entry;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clickStatisticModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Estadística de clic con ID ${id} no encontrada`);
    }
  }

  // Obtener resumen de clics agrupados por texto
  async getClickSummary(): Promise<any[]> {
    return this.clickStatisticModel.aggregate([
      {
        $group: {
          _id: '$text',
          count: { $sum: 1 },
          firstClick: { $min: '$createdAt' },
          lastClick: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]).exec();
  }

  // Obtener resumen de clics de un usuario específico agrupados por texto
  async getUserClickSummary(userId: string): Promise<any[]> {
    return this.clickStatisticModel.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$text',
          count: { $sum: 1 },
          firstClick: { $min: '$createdAt' },
          lastClick: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]).exec();
  }
} 