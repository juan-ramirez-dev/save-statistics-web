import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@example.com', description: 'Correo electrónico del usuario' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'contraseña123', description: 'Contraseña del usuario' })
  @IsNotEmpty()
  @IsString()
  password: string;
} 