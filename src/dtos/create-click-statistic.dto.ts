import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClickStatisticDto {
  @ApiProperty({
    description: 'Descripción del clic (botón, enlace, etc.)',
    example: 'btn_submit_form',
    minLength: 1
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  text: string;
} 