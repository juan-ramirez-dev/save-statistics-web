import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class SimpleClickStatisticDto {
  @ApiProperty({
    description: 'Texto identificador del elemento clickeado',
    example: 'btn_login'
  })
  @IsNotEmpty({ message: 'El texto es requerido' })
  @IsString({ message: 'El texto debe ser una cadena de texto' })
  text: string;

  @ApiProperty({
    description: 'Token personal único del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsNotEmpty({ message: 'El token personal es requerido' })
  @IsUUID(4, { message: 'El token personal debe ser un UUID válido (v4)' })
  uuid: string;
} 