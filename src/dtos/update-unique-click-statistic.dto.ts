import { IsOptional, IsString, MinLength, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUniqueClickStatisticDto {
  @ApiProperty({
    description: 'Text identifier of the element where the click was made',
    example: 'btn_submit_form',
    minLength: 1,
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  text?: string;

  @ApiProperty({
    description: 'Number of times this text has been clicked',
    example: 5,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;
} 