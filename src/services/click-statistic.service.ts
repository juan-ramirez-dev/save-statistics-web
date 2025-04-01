import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClickStatistic, ClickStatisticDocument } from '../schemas/click-statistic.schema';
import { CreateClickStatisticDto } from '../dtos/create-click-statistic.dto';
import { UserService } from './user.service';

@Injectable()
export class ClickStatisticService {
  constructor(
    @InjectModel(ClickStatistic.name) private clickStatisticModel: Model<ClickStatisticDocument>,
    private userService: UserService,
  ) {}

  async create(createClickStatisticDto: CreateClickStatisticDto, userId: string): Promise<ClickStatisticDocument> {
    // Validar que el token personal sea válido para este usuario
    await this.userService.validatePersonalToken(userId, createClickStatisticDto.personalToken);
    
    // Crear y guardar el registro de estadística de clic
    const newClickStatistic = new this.clickStatisticModel({
      text: createClickStatisticDto.text,
      userId,
    });

    return newClickStatistic.save();
  }

  /**
   * Crea una estadística de clic usando solo el token personal
   * @param text Texto del clic
   * @param personalToken Token personal del usuario
   * @returns La estadística de clic creada
   * @throws UnauthorizedException si el token no es válido
   */
  async createWithPersonalToken(text: string, personalToken: string): Promise<ClickStatisticDocument> {
    const user = await this.userService.findByPersonalToken(personalToken);
    
    if (!user) {
      throw new UnauthorizedException('Token personal no válido');
    }
    
    const newClickStatistic = new this.clickStatisticModel({
      text,
      userId: user.id,
    });
    
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
  async getUserClickSummary(userId: string, personalToken: string): Promise<any[]> {
    // Validar que el token personal sea válido para este usuario
    await this.userService.validatePersonalToken(userId, personalToken);
    
    return this.clickStatisticModel.aggregate([
      { $match: { userId } },
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