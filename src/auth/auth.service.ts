import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../services/user.service';
import { UserDocument } from '../schemas/user.schema';
import { LoginDto } from '../dtos/login.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const userId = (user._id as Types.ObjectId).toString();
    
    const payload = { 
      sub: userId, 
      email: user.email,
      role: user.role 
    };
    
    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new UnauthorizedException('El correo electrónico ya está registrado');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Crear el usuario con la contraseña encriptada
    const newUser = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    const userId = (newUser._id as Types.ObjectId).toString();
    
    // Generar y devolver el token
    const payload = { 
      sub: userId, 
      email: newUser.email,
      role: newUser.role 
    };
    
    return {
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
} 