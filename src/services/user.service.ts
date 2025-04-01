import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Busca un usuario por su token personal
   * @param personalToken Token personal a buscar
   * @returns El usuario encontrado o null si no existe
   */
  async findByPersonalToken(personalToken: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ personalToken }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async update(id: string, updateData: Partial<User>): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updatedUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  /**
   * Valida que el token personal proporcionado coincida con el del usuario
   * @param userId ID del usuario a validar
   * @param personalToken Token personal a validar
   * @returns true si el token es válido
   * @throws UnauthorizedException si el token no es válido
   * @throws NotFoundException si el usuario no existe
   */
  async validatePersonalToken(userId: string, personalToken: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    
    if (user.personalToken !== personalToken) {
      throw new UnauthorizedException('Token personal no válido para este usuario');
    }
    
    return true;
  }
} 