import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SimpleUniqueClickStatisticDto {
  @ApiProperty({
    description: 'Text identifier of the element where the click was made',
    example: 'btn_submit_form',
    minLength: 1
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  text: string;

  @ApiProperty({
    description: 'User\'s personal token (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  uuid: string;
} 