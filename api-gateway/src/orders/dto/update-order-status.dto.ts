import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'processing', enum: ['processing', 'shipped', 'delivered', 'cancelled'] })
  @IsString()
  @IsNotEmpty()
  status: string;
}