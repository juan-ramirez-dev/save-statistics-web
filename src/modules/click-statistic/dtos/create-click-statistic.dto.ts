import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClickStatisticDto {
  @ApiProperty({
    description: 'Texto identificativo del elemento donde se realizó el clic',
    example: 'btn_submit_form',
    minLength: 1
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  text: string;

  @ApiProperty({
    description: 'Token personal único del usuario que realiza el clic (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  personalToken: string;
}